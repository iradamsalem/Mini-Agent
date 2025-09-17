import '../../config/loadEnv.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI((process.env.GOOGLE_API_KEY ?? '').trim());

/**
 * Generates a vector embedding for the given text using Google Generative AI.
 *
 * - Uses the `text-embedding-004` model (768-dimensional embedding).
 * - Returns the raw embedding values as an array of numbers (float32).
 *
 * @async
 * @param {string} text - Input text to be embedded.
 * @returns {Promise<number[]>} A numeric array representing the text embedding vector.
 * @throws {Error} If GOOGLE_API_KEY is missing or the API call fails.
 */
export async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' }); // 768D
  const res = await model.embedContent(text);
  return res.embedding.values; // number[]
}
