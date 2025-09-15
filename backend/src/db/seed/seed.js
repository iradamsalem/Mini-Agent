import 'dotenv/config';
import { pool } from '../pool.js';
import fs from 'fs';

async function main() {
  // Users
  await pool.query(`INSERT INTO users(name,balance) VALUES
    ('Alice',250),('Bob',120),('Charlie',500) ON CONFLICT DO NOTHING;`);

  // Docs + simple chunking
  const docs = [
    { title: 'Refund Policy', text: 'Refunds are available within 30 days if the product is unused.' },
    { title: 'Shipping', text: 'Shipping takes 3-5 business days for domestic orders.' }
  ];

  for (const d of docs) {
    const { rows } = await pool.query(
      'INSERT INTO documents(title,text) VALUES($1,$2) RETURNING id', [d.title, d.text]
    );
    const docId = rows[0].id;
    const chunks = d.text.match(/.{1,300}/g) || [d.text];
    let idx = 0;
    for (const c of chunks) {
      // נקרא ל־embedText ישירות כדי לשמור embedding
      const { embedText } = await import('../../services/retrieval/embeddings.service.js');
      const emb = await embedText(c);
      await pool.query(
        'INSERT INTO embeddings(document_id,chunk_index,embedding,text) VALUES($1,$2,$3,$4)',
        [docId, idx++, emb, c]
      );
    }
  }

  console.log('✅ Seed complete');
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
