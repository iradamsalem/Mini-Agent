// src/services/tools/rag.tool.js
import { searchSimilarChunks } from '../../db/repositories/embeddings.repo.js';
import { answerWithContext } from '../retrieval/answerWithContext.js';

const STRONG_KW = /(refunds?|returns?|shipping|privacy|security|faq|about|product|polic(y|ies))/i;

export async function ragTool(query, { minScore = 0.95, k = 10 } = {}) {
  const expanded = `${String(query || '')} refund refunds return returns policy policies shipping privacy security faq about product`;

  const chunks = await searchSimilarChunks(expanded, k);

  const allow = (c) =>
    c.distance <= minScore ||
    (STRONG_KW.test(query) && c.distance <= minScore + 0.05);

  const good = (chunks || []).filter(allow);

  let chosen = good;
  let used = 'rag:hit';

  if (!chosen.length && chunks?.length) {
    chosen = chunks.slice(0, Math.min(5, chunks.length));
    used = 'rag:low_conf_topk';
  }

  if (!chosen.length) {
    return { answer: null, sources: [], used: 'rag:no_hit' };
  }

  const { answer } = await answerWithContext(query, chosen);

  const sources = chosen.slice(0, 5).map((c) => ({
    id: c.id,
    title: c.title,
    chunkIndex: c.chunk_index,
    text: c.text,
    distance: c.distance,
  }));

  return { answer, sources, used };
}
