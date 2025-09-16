// backend/src/db/seed/seed.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../pool.js';
import { embedText } from '../../services/retrieval/embeddings.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.resolve(process.cwd(), 'backend', 'data', 'docs');

function chunkText(txt, size = 800, overlap = 150) {
  const chunks = [];
  for (let i = 0; i < txt.length; i += (size - overlap)) {
    chunks.push(txt.slice(i, i + size));
  }
  return chunks.map(c => c.trim()).filter(Boolean);
}

async function main() {
  console.log('🚀 Seeding database...');

  // משתמשי דמו
  await pool.query(`
    INSERT INTO users(name,balance)
    VALUES ('Alice',250),('Bob',120),('Charlie',500)
    ON CONFLICT DO NOTHING;
  `);

  // טעינת קבצים מהתיקייה
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
  if (files.length === 0) {
    console.log('⚠️ No docs found in', DOCS_DIR);
    return;
  }

  for (const file of files) {
    const fullPath = path.join(DOCS_DIR, file);
    const text = fs.readFileSync(fullPath, 'utf-8');

    const { rows } = await pool.query(
      `INSERT INTO documents(title, text) VALUES($1,$2) RETURNING id`,
      [file, text]
    );
    const docId = rows[0].id;

    const chunks = chunkText(text);
    for (let i = 0; i < chunks.length; i++) {
      const emb = await embedText(chunks[i]);
      await pool.query(
        `INSERT INTO embeddings(document_id, chunk_index, text, embedding)
         VALUES($1,$2,$3,$4::vector)
         ON CONFLICT (document_id, chunk_index) DO NOTHING`,
        [docId, i, chunks[i], emb]
      );
    }
    console.log(`📄 ${file}: inserted ${chunks.length} chunks`);
  }

  console.log('✅ Seed complete');
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
