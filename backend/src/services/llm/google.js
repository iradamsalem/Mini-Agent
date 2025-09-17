import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');

const genAI = new GoogleGenerativeAI(API_KEY);

// זיהוי עברית
const hasHebrew = (s) => /[א-ת]/.test(String(s || ''));

// תשובה ישירה (ללא כלים) עם תמיכה בעברית + retry ל-503
export async function llmAnswer(query) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = hasHebrew(query)
    ? `ענה בעברית בצורה ברורה וקצרה:\n${query}`
    : String(query);

  for (let i = 0; i < 2; i++) {
    try {
      const out = await model.generateContent(prompt);
      return out.response.text();
    } catch (e) {
      if (String(e).includes('503') && i === 0) {
        await new Promise(r => setTimeout(r, 600));
        continue;
      }
      throw e;
    }
  }
}

// מילות מפתח (עברית/אנגלית)
const KW = {
  db: /(balance|user\s*\d+|יתרה|משתמש\s*\d+)/i,
  rag: /(policy|refund|shipping|privacy|security|terms|faq|product|about|מדיניות|החזר|החזרים|משלוח|פרטיות|אבטחה|תנאים|מוצר|שאלות נפוצות)/i,
  chit: /(בדיחה|צחוק|joke|laugh|tell me a joke|שלום|היי|מה קורה|ספר לי)/i,
};

// בחירת כלי: דטרמיניסטי קודם, LLM רק אם חייבים
export async function classifyTool(question) {
  const q = String(question || '');

  // שכבה 1 — חוקים דטרמיניסטיים
  if (KW.db.test(q)) return { tool: 'db', tool_args: {} };
  if (KW.rag.test(q)) return { tool: 'rag' };
  if (KW.chit.test(q)) return { tool: 'direct' };

  // שכבה 2 — LLM (עם הנחיה ברורה + תמיכה בעברית)
  const system = `
Return ONLY one of:
{"tool":"rag"} | {"tool":"db","tool_args":{"userId":<int?>}} | {"tool":"direct"}.
Rules:
- "db": balance/user id queries only.
- "rag": questions about policies, refund, shipping, privacy, security, product info, FAQ, about.
- "direct": chit-chat, jokes, greetings, general knowledge.
The question may be in Hebrew. Keep JSON minimal.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = hasHebrew(q)
    ? system + '\n\nשאלה (בעברית): ' + q + '\nענה רק JSON כאמור.'
    : system + '\n\nQ: ' + q;

  try {
    const r = await model.generateContent(prompt);
    const raw = r.response.text().trim();
    const clean = raw.replace(/^```json|^```|```$/gmi, '').trim();
    const parsed = JSON.parse(clean);
    if (!['rag', 'db', 'direct'].includes(parsed.tool)) return { tool: 'direct' };
    return parsed;
  } catch {
    return { tool: 'direct' };
  }
}
