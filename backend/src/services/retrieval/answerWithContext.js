import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function answerWithContext(query, chunks) {
  const context = chunks.map(c => `- ${c.text}`).join('\n');
  const prompt = `Use ONLY the context below to answer the question.\nContext:\n${context}\n\nQuestion: ${query}\nAnswer:`;
  const out = await model.generateContent(prompt);
  return { answer: out.response.text() };
}
