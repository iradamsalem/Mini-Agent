import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const IS_TEST = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === '1';
const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
const GEN_MODEL = (process.env.GOOGLE_GEN_MODEL ?? 'gemini-1.5-flash').trim();

// helpers (English-only)
function isDbIntent(q) {
  const money = /(balance|account\s*balance|how\s*much\s*money)/i;
  const who   = /(user|account|id)/i;
  return money.test(q) && who.test(q);
}

// ✅ fixed regex: note the `^|[^\w]` alternation and no \p classes.
function extractUserId(q) {
  const m = String(q || '').match(/(?:^|[^\w])(?:user|id)\s*#?\s*(\d{1,10})(?!\d)/i);
  return m ? Number(m[1]) : null;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------- llmAnswer ----------
export async function llmAnswer(query) {
  // TEST MODE: deterministic answer without external call
  if (IS_TEST) return '[test] direct answer';

  if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: GEN_MODEL });
  const prompt = `Answer in clear English only:\n${String(query)}`;

  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    try {
      const out = await model.generateContent(prompt);
      return out.response.text();
    } catch (e) {
      const overload = String(e).includes('503');
      if (overload && i < attempts - 1) {
        await sleep(1000 * (i + 1));
        continue;
      }
      return 'Sorry, the model is overloaded right now. Please try again in a moment.';
    }
  }
}

// ---------- classifyTool ----------
const KW = {
  rag: /(policy|policies|refund|shipping|privacy|security|terms|faq|product|about)/i,
  chit: /(joke|hello|hi|hey|tell\s*me)/i,
};

export async function classifyTool(question) {
  const q = String(question || '');

  // deterministic first
  if (isDbIntent(q)) {
    return { tool: 'db', tool_args: { userId: extractUserId(q) ?? null } };
  }
  if (KW.rag.test(q))  return { tool: 'rag' };
  if (KW.chit.test(q)) return { tool: 'direct' };

  // TEST MODE: no external call
  if (IS_TEST) return { tool: 'direct' };

  if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: GEN_MODEL });

  const system = `
Return ONLY one of the following JSONs:
{"tool":"rag"} | {"tool":"db","tool_args":{"userId":<int?>}} | {"tool":"direct"}.
Rules:
- "db": balance/user id queries only. Extract user id if present.
- "rag": questions about policies, refund, shipping, privacy, security, product info, FAQ, about.
- "direct": chit-chat, jokes, greetings, general knowledge.
Keep JSON minimal, no markdown.`;

  const prompt = `${system}\n\nQ: ${q}`;
  const attempts = 3;

  for (let i = 0; i < attempts; i++) {
    try {
      const r = await model.generateContent(prompt);
      const raw = r.response.text().trim();
      const clean = raw.replace(/^```json|^```|```$/gmi, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.tool === 'db') {
        if (!parsed.tool_args || typeof parsed.tool_args.userId === 'undefined') {
          parsed.tool_args = { userId: extractUserId(q) ?? null };
        }
      }
      if (!['rag','db','direct'].includes(parsed.tool)) return { tool: 'direct' };
      return parsed;
    } catch (e) {
      const overload = String(e).includes('503');
      if (overload && i < attempts - 1) {
        await sleep(1000 * (i + 1));
        continue;
      }
      return { tool: 'direct' };
    }
  }
}
