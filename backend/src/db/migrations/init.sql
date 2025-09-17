CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
  id      INT PRIMARY KEY,
  name    TEXT NOT NULL UNIQUE,
  balance INT  NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id    SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS embeddings (
  id           SERIAL PRIMARY KEY,
  document_id  INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index  INT NOT NULL,
  text         TEXT NOT NULL,
  embedding    VECTOR(768) NOT NULL,
  UNIQUE(document_id, chunk_index)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_embeddings_embedding'
  ) THEN
    CREATE INDEX idx_embeddings_embedding
      ON embeddings USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
