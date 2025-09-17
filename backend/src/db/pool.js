import '../config/loadEnv.js';
import pg from 'pg';

const { Pool } = pg;

/**
 * PostgreSQL connection pool instance.
 *
 * The pool is configured using the DATABASE_URL environment variable.
 * SSL is disabled by default (set to `true` if connecting to a cloud-hosted database that requires it).
 *
 * @type {import('pg').Pool}
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
