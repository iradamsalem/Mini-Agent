import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI((process.env.GOOGLE_API_KEY ?? '').trim());

export async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }); // 768D
  const res = await model.embedContent(text);
  return res.embedding.values; // number[]
}
