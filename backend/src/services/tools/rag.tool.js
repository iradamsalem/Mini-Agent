import { searchSimilarChunks } from '../../db/repositories/embeddings.repo.js';
import { answerWithContext } from '../retrieval/answerWithContext.js';

// minScore — סף מקסימלי ל-distance (ככל שקטן יותר — דומה יותר)
export async function ragTool(query, { minScore = 0.55, k = 8 } = {}) {
  const chunks = await searchSimilarChunks(query, k);
  const good = chunks.filter(c => c.distance <= minScore);

  if (good.length === 0) {
    return { answer: null, sources: [], used: 'rag:no_hit' };
  }

  const { answer } = await answerWithContext(query, good);
  return {
    answer,
    sources: good.map(c => ({
      id: c.id,
      snippet: c.text.slice(0, 150),
      distance: c.distance
    }))
  };
}
