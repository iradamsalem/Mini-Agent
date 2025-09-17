// src/db/repositories/users.repo.js
import { pool } from '../pool.js'; // עדכן אם הנתיב אצלך שונה

export async function getUserById(userId) {
  const { rows } = await pool.query(
    'SELECT id, name, balance FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] ?? null;
}
