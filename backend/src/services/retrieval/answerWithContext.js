import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const IS_TEST = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === '1';
const API_KEY = (process.env.GOOGLE_API_KEY ?? '').trim();
const GEN_MODEL = (process.env.GOOGLE_GEN_MODEL ?? 'gemini-1.5-flash').trim();
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function answerWithContext(query, chunks) {
  // TEST MODE: deterministic answer from retrieved context
  if (IS_TEST) {
    const first = (chunks?.[0]?.text || '').slice(0, 180);
    return { answer: first ? `[test] Using retrieved context: ${first} ...` : "[test] I don't know (no context)." };
  }

  if (!API_KEY) throw new Error('GOOGLE_API_KEY is missing in backend/.env');

  const genAI = new GoogleGenerativeAI(API_KEY);
  const chatModel = genAI.getGenerativeModel({ model: GEN_MODEL });

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
      const overload = String(e).includes('503');
      if (overload && i < attempts - 1) {
        await sleep(1000 * (i + 1));
        continue;
      }
      return { answer: "Sorry, the model is overloaded right now. Please try again in a moment." };
    }
  }
}
