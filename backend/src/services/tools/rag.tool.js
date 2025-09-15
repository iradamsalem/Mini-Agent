import { searchSimilarChunks } from '../../db/repositories/embeddings.repo.js';
import { answerWithContext } from '../retrieval/answerWithContext.js';

export async function ragTool(query) {
  const chunks = await searchSimilarChunks(query, 5);
  const { answer } = await answerWithContext(query, chunks);
  return { answer, sources: chunks.map(c => ({ id: c.id, snippet: c.text.slice(0,150) })) };
}
