import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const IS_TEST = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === '1';
const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
const GEN_MODEL = (process.env.GOOGLE_GEN_MODEL ?? 'gemini-1.5-flash').trim();

/**
 * Determines whether a query is a database-related intent
 * by looking for both "money" and "user/id" keywords.
 *
 * @param {string} q - The user query string.
 * @returns {boolean} True if the query likely refers to a DB lookup.
 */
function isDbIntent(q) {
  const money = /(balance|account\s*balance|how\s*much\s*money)/i;
  const who   = /(user|account|id)/i;
  return money.test(q) && who.test(q);
}

/**
 * Extracts a user ID from the query string if present.
 * Matches patterns like "user 123", "id #456", etc.
 *
 * @param {string} q - The user query string.
 * @returns {number|null} The numeric userId if found, otherwise null.
 */
function extractUserId(q) {
  const m = String(q || '').match(/(?:^|[^\w])(?:user|id)\s*#?\s*(\d{1,10})(?!\d)/i);
  return m ? Number(m[1]) : null;
}

/**
 * Simple async sleep helper.
 *
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Generates a direct answer using Google Generative AI (Gemini).
 *
 * - If running in test mode, returns a deterministic fake answer.
 * - Retries up to 3 times if API returns a 503 (overloaded).
 *
 * @async
 * @param {string} query - User's query text.
 * @returns {Promise<string>} The generated answer text or an error message if overloaded.
 * @throws {Error} If GOOGLE_API_KEY is missing in environment.
 */
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

const KW = {
  rag: /(policy|policies|refund|shipping|privacy|security|terms|faq|product|about)/i,
  chit: /(joke|hello|hi|hey|tell\s*me)/i,
};

/**
 * Classifies which tool should handle a given user question:
 *
 * - `db`: For user balance or account queries (extracts userId if present)
 * - `rag`: For policy, refund, shipping, privacy, FAQ, product or about questions
 * - `direct`: For chit-chat, greetings, jokes, general fallback
 *
 * Uses a simple keyword heuristic first, and falls back to Google Generative AI
 * if no deterministic match is found (unless running in test mode).
 *
 * @async
 * @param {string} question - User question text.
 * @returns {Promise<{tool:'rag'|'db'|'direct', tool_args?:{userId:number|null}}>}
 * An object specifying which tool to use and optional arguments.
 * @throws {Error} If GOOGLE_API_KEY is missing when needed.
 */
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
