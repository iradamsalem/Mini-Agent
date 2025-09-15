import { pool } from '../pool.js';

export async function getUserBalance(id) {
  const { rows } = await pool.query('SELECT balance FROM users WHERE id=$1', [id]);
  return rows[0]?.balance ?? 0;
}
