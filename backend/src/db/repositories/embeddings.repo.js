import { pool } from '../pool.js';
import { embedText } from '../../services/retrieval/embeddings.service.js';

const toPgVector = (arr) => `[${arr.join(',')}]`;

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
