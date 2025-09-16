// backend/src/db/repositories/users.repo.js
import { pool } from '../pool.js';

export async function getUserBalance(userId) {
  const { rows } = await pool.query(
    'SELECT balance FROM users WHERE id = $1',
    [userId]
  );
  return rows[0]?.balance ?? null;
}
