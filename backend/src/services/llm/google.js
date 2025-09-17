import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');

const genAI = new GoogleGenerativeAI(API_KEY);

// ---------- helpers (English-only) ----------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function isDbIntent(q) {
  const money = /(balance|account\s*balance|how\s*much\s*money)/i;
  const who   = /(user|account|id)/i;
  return money.test(q) && who.test(q);
}
function extractUserId(q) {
  const m = String(q || '').match(/(?:^|[^\w])(?:user|id)\s*#?\s*(\d{1,10})(?!\d)/i);
  return m ? Number(m[1]) : null;
}
// --------------------------------------------

// Direct LLM answer (English only) with retry/backoff + friendly fallback
export async function llmAnswer(query) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Answer in clear English only:\n${String(query)}`;

  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    try {
      const out = await model.generateContent(prompt);
      return out.response.text();
    } catch (e) {
      const isOverload = String(e).includes('503');
      if (isOverload && i < attempts - 1) {
        console.warn(`⚠️ Gemini 503 in llmAnswer, retry ${i + 2}/${attempts}...`);
        await sleep(1000 * (i + 1)); // 1s, 2s
        continue;
      }
      // Friendly fallback instead of throwing 500 to the client
      return "Sorry, the model is overloaded right now. Please try again in a moment.";
    }
  }
}

// English-only keywords
const KW = {
  rag: /(policy|policies|refund|shipping|privacy|security|terms|faq|product|about)/i,
  chit: /(joke|hello|hi|hey|tell\s*me)/i,
};

// Tool selection: rules first, then LLM fallback (with retry). Defaults to "direct" on failure.
export async function classifyTool(question) {
  const q = String(question || '');

  // Layer 1: deterministic rules
  if (isDbIntent(q)) {
    const uid = extractUserId(q);
    return { tool: 'db', tool_args: { userId: uid ?? null } };
  }
  if (KW.rag.test(q))  return { tool: 'rag' };
  if (KW.chit.test(q)) return { tool: 'direct' };

  // Layer 2: LLM fallback (English JSON only)
  const system = `
Return ONLY one of the following JSONs:
{"tool":"rag"} | {"tool":"db","tool_args":{"userId":<int?>}} | {"tool":"direct"}.
Rules:
- "db": balance/user id queries only. Extract user id if present.
- "rag": questions about policies, refund, shipping, privacy, security, product info, FAQ, about.
- "direct": chit-chat, jokes, greetings, general knowledge.
Keep JSON minimal, no markdown.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      if (!['rag', 'db', 'direct'].includes(parsed.tool)) return { tool: 'direct' };
      return parsed;
    } catch (e) {
      const isOverload = String(e).includes('503');
      if (isOverload && i < attempts - 1) {
        console.warn(`⚠️ Gemini 503 in classifyTool, retry ${i + 2}/${attempts}...`);
        await sleep(1000 * (i + 1));
        continue;
      }
      return { tool: 'direct' }; // safe default
    }
  }
}
