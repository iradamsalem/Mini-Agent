import { searchSimilarChunks } from '../../db/repositories/embeddings.repo.js';
import { answerWithContext } from '../retrieval/answerWithContext.js';

// English strong keywords (optional softening near threshold)
const STRONG_KW = /(refund|returns?|shipping|privacy|security|faq|about|product|policy|policies)/i;

export async function ragTool(query, { minScore = 0.68, k = 8 } = {}) {
  // light EN-only expansion
  const expanded = `${String(query || '')} refund returns policy shipping privacy security faq about`;

  const chunks = await searchSimilarChunks(expanded, k);

  const allow = (c) =>
    c.distance <= minScore ||
    (STRONG_KW.test(query) && c.distance <= minScore + 0.05);

  const good = (chunks || []).filter(allow);

  if (good.length === 0) {
    return { answer: null, sources: [], used: 'rag:no_hit' };
  }

  const { answer } = await answerWithContext(query, good);
  return {
    answer,
    sources: good.slice(0, 5).map(c => ({
      id: c.id,
      snippet: c.text.slice(0, 150),
      distance: c.distance
    })),
  };
}
