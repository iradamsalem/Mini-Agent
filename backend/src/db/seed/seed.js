import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { pool } from '../pool.js';
import { embedText } from '../../services/retrieval/embeddings.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.resolve(__dirname, '../../../data/docs');

function chunkText(txt, size = 800, overlap = 150) {
  const chunks = [];
  for (let i = 0; i < txt.length; i += (size - overlap)) {
    chunks.push(txt.slice(i, i + size));
  }
  return chunks.map(c => c.trim()).filter(Boolean);
}

const toPgVector = (arr) => `[${arr.join(',')}]`;

async function main() {
  console.log('🚀 Seeding database...');

  await pool.query(`
    INSERT INTO users(id, name, balance) VALUES
      (123, 'Alice',   250),
      (124, 'Bob',     120),
      (125, 'Charlie', 500)
    ON CONFLICT (id) DO NOTHING;
  `);

  if (!fs.existsSync(DOCS_DIR)) {
    console.log(`⚠️ Docs directory not found: ${DOCS_DIR}`);
    await pool.end();
    return;
  }

  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
  if (files.length === 0) {
    console.log('⚠️ No .txt/.md files found under docs');
    await pool.end();
    return;
  }

  for (const file of files) {
    const full = path.join(DOCS_DIR, file);
    const text = fs.readFileSync(full, 'utf-8');

    const { rows } = await pool.query(
      `INSERT INTO documents(title, text) VALUES ($1, $2) RETURNING id`,
      [file, text]
    );
    const docId = rows[0].id;

    const chunks = chunkText(text);
    for (let i = 0; i < chunks.length; i++) {
      const emb = await embedText(chunks[i]);
      const embVec = toPgVector(emb);
      await pool.query(
        `INSERT INTO embeddings(document_id, chunk_index, text, embedding)
         VALUES ($1, $2, $3, $4::vector)
         ON CONFLICT (document_id, chunk_index) DO NOTHING`,
        [docId, i, chunks[i], embVec]
      );
    }
    console.log(`📄 ${file}: inserted ${chunks.length} chunks`);
  }

  console.log('✅ Seed complete');
  await pool.end();
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
