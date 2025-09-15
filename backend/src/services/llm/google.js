import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function classifyTool(query) {
  const prompt = `
You are a tool selector. For the user query, choose one of: "rag", "db", or "direct".
If db, also provide JSON tool_args, e.g. {"userId":123}.
Respond ONLY in JSON: {"tool":"rag|db|direct","tool_args":{}}.

Query: ${query}
`;
  const out = await model.generateContent(prompt);
  const text = out.response.text();
  try { return JSON.parse(text); } catch { return { tool: 'direct', tool_args: {} }; }
}

export async function llmAnswer(query) {
  const prompt = `Answer clearly and briefly:\n${query}`;
  const out = await model.generateContent(prompt);
  return out.response.text();
}
