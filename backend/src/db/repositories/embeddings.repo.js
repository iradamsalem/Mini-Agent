import { pool } from '../pool.js';
import { embedText } from '../../services/retrieval/embeddings.service.js';

export async function searchSimilarChunks(query, k = 5) {
  const qEmb = await embedText(query);
  const { rows } = await pool.query(
    `SELECT id, text
     FROM embeddings
     ORDER BY embedding <-> $1
     LIMIT $2`,
    [qEmb, k]
  );
  return rows;
}
