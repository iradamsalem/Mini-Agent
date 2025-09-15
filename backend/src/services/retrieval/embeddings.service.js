import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Gemini currently returns embeddings via the embeddings API (model name may differ):
export async function embedText(text) {
  // דוגמה גנרית; עדכן לשם המודל אמבדינג העדכני שלך
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const res = await model.embedContent(text);
  const vec = res.embedding.values; // Array<number>
  return vec; // pg-vector יקבל כ־float[] (node-postgres תומך במערכים)
}
