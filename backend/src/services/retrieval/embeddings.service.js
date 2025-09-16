// backend/src/services/retrieval/embeddings.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }); // dim=768
  const res = await model.embedContent(text);
  return res.embedding.values; // number[]
}
