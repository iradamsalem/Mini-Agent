// backend/src/services/retrieval/answerWithContext.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function answerWithContext(query, chunks) {
  const context = chunks.map(c => `- ${c.text}`).join('\n');
  const prompt =
`You are a helpful assistant. Use ONLY the context to answer the question.
If insufficient, say you don't know.

Context:
${context}

Question: ${query}
Answer in 2–3 sentences.`;

  const out = await chatModel.generateContent(prompt);
  return { answer: out.response.text() };
}
