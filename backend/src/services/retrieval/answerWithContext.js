import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');

const genAI = new GoogleGenerativeAI(API_KEY);
const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function answerWithContext(query, chunks) {
  const context = (chunks || []).map((c) => `- ${c.text}`).join('\n');

  const prompt = `You are a helpful assistant. Use ONLY the provided context to answer.
If the context is insufficient, say you don't know.
Always respond in clear English.

Context:
${context}

Question: ${query}

Final answer (2–3 short sentences):`;

  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    try {
      const out = await chatModel.generateContent(prompt);
      return { answer: out.response.text() };
    } catch (e) {
      const isOverload = String(e).includes('503');
      if (isOverload && i < attempts - 1) {
        console.warn(`⚠️ Gemini 503 in answerWithContext, retry ${i + 2}/${attempts}...`);
        await sleep(1000 * (i + 1)); // 1s, 2s
        continue;
      }
      // Friendly fallback so /api/ask doesn't fail with 500
      return { answer: "Sorry, the model is overloaded right now. Please try again in a moment." };
    }
  }
}
