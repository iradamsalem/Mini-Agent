-- יצירת הרחבת pgvector (פעם אחת במסד)
CREATE EXTENSION IF NOT EXISTS vector;

-- טבלאות דמו
CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS documents(
  id SERIAL PRIMARY KEY,
  title TEXT,
  text TEXT NOT NULL
);

-- embeddings בגודל 768/1024 לפי המודל שבו תשתמש
CREATE TABLE IF NOT EXISTS embeddings(
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  embedding vector(768), -- התאמה לגודל embedding בפועל
  text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
