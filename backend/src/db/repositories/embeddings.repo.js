import { pool } from '../pool.js';
import { embedText } from '../../services/retrieval/embeddings.service.js';

/**
 * Converts a numeric array into a Postgres pgvector textual format.
 * Example: [0.1, 0.2] -> "[0.1,0.2]"
 * @param {number[]} arr - Array of embedding values (float32).
 * @returns {string} Text representation for pgvector in Postgres.
 */
const toPgVector = (arr) => `[${arr.join(',')}]`;

/**
 * Searches for the most similar chunks in the database using pgvector.
 * It embeds the query text, performs an ANN (Approximate Nearest Neighbor) search,
 * and returns the closest document chunks along with their cosine distances.
 *
 * @async
 * @param {string} query - The text query from the user.
 * @param {number} [k=10] - Number of top results to return.
 * @param {number} [probes=40] - Number of probes for ivfflat (controls accuracy/performance tradeoff).
 * @returns {Promise<Array<{id:number,title:string,chunk_index:number,text:string,distance:number}>>}
 * An array of objects representing the most similar chunks and their distance scores.
 */
export async function searchSimilarChunks(query, k = 10, probes = 40) {
  const qvec = await embedText(query);
  const vec = toPgVector(qvec);

  const p = Math.max(1, Math.min(1000, Number(probes) || 40));
  await pool.query(`SET ivfflat.probes = ${p}`);

  const { rows } = await pool.query(
    `SELECT e.id, d.title, e.chunk_index, e.text,
            (e.embedding <=> $1::vector) AS distance
     FROM embeddings e
     JOIN documents d ON d.id = e.document_id
     ORDER BY e.embedding <=> $1::vector
     LIMIT $2`,
    [vec, k]
  );

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    chunk_index: r.chunk_index,
    text: r.text,
    distance: Number(r.distance)
  }));
}
