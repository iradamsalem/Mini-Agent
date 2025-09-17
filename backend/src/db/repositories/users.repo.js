// src/db/repositories/users.repo.js
import { pool } from '../pool.js'; // Update the path if different in your project

/**
 * Retrieves a user by their unique ID from the database.
 *
 * @async
 * @param {number} userId - The unique identifier of the user to retrieve.
 * @returns {Promise<{id:number,name:string,balance:number}|null>}
 * Resolves to an object containing the user's id, name, and balance if found,
 * or null if no matching user exists.
 */
export async function getUserById(userId) {
  const { rows } = await pool.query(
    'SELECT id, name, balance FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  return rows[0] ?? null;
}
