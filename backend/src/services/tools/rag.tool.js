// src/services/tools/rag.tool.js
import { searchSimilarChunks } from '../../db/repositories/embeddings.repo.js';
import { answerWithContext } from '../retrieval/answerWithContext.js';

const STRONG_KW = /(refunds?|returns?|shipping|privacy|security|faq|about|product|polic(y|ies))/i;

/**
 * Retrieves relevant document chunks using semantic search (RAG) and generates
 * a contextual answer using an LLM.
 *
 * - Expands the query with common keywords to improve recall.
 * - Filters results by a minimum similarity score, with relaxed threshold if
 *   the query matches strong keywords (refund, shipping, policy, etc.).
 * - Falls back to top-k chunks if no result meets the threshold.
 * - Uses `answerWithContext` to generate a final answer based only on chosen chunks.
 *
 * @async
 * @param {string} query - The user query string.
 * @param {{minScore?:number,k?:number}} [options] - Optional configuration.
 * @param {number} [options.minScore=0.95] - Minimum similarity score to accept a chunk.
 * @param {number} [options.k=10] - Number of top chunks to retrieve from the database.
 * @returns {Promise<{answer:string|null,sources:Array<{id:number,title:string,chunkIndex:number,text:string,distance:number}>,used:string}>}
 * Object containing the generated answer (or null if no match), the selected source chunks, and
 * a `used` tag describing which path was taken (hit, low_conf_topk, no_hit).
 */
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
