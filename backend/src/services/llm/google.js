// backend/src/services/llm/google.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI((process.env.GOOGLE_API_KEY ?? '').trim());

export async function llmAnswer(query) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const out = await model.generateContent(query);
  return out.response.text();
}

export async function classifyTool(question) {
  const system = `
Return ONLY a compact JSON object like:
{"tool":"rag"} or {"tool":"db","tool_args":{"userId":123}} or {"tool":"direct"}.

Rules:
- Use "db" for balance/user id queries (e.g., "balance of user 123").
- Use "rag" for policy/docs/faq/shipping/privacy/terms/product info questions.
- Otherwise use "direct".
`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  try {
    const r = await model.generateContent(system + '\n\n' + question);
    return JSON.parse(r.response.text());
  } catch {
    // fallback היוריסטי
    if (/balance|user\s*\d+/i.test(question)) return { tool: 'db', tool_args: {} };
    if (/policy|refund|shipping|privacy|terms|faq|product/i.test(question)) return { tool: 'rag' };
    return { tool: 'direct' };
  }
}
