import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');

const genAI = new GoogleGenerativeAI(API_KEY);
const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const hasHebrew = (s) => /[א-ת]/.test(String(s || ''));

export async function answerWithContext(query, chunks) {
  const context = chunks.map(c => `- ${c.text}`).join('\n');
  const base =
`You are a helpful assistant. Use ONLY the context to answer the question.
If insufficient, say you don't know.

Context:
${context}

Question: ${query}
`;
  const prompt = hasHebrew(query)
    ? base + 'Answer in Hebrew, in 2–3 short sentences.'
    : base + 'Answer in 2–3 sentences.';

  for (let i = 0; i < 2; i++) {
    try {
      const out = await chatModel.generateContent(prompt);
      return { answer: out.response.text() };
    } catch (e) {
      if (String(e).includes('503') && i === 0) {
        await new Promise(r => setTimeout(r, 600));
        continue;
      }
      throw e;
    }
  }
}
