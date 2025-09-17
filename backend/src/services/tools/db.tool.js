import { getUserById } from '../../db/repositories/users.repo.js';

/**
 * Database tool for retrieving a user's balance by ID.
 *
 * - If `userId` is missing or null, returns a help message with an example query.
 * - If no matching user is found, returns a "not found" message.
 * - Otherwise, returns a formatted string including the user's name and balance.
 *
 * @async
 * @param {{userId:number|null|undefined}} params - Object containing the userId to look up.
 * @returns {Promise<string>} A message describing the user's balance or an error/help message.
 */
export async function dbTool({ userId }) {
  if (userId === null || typeof userId === 'undefined') {
    return 'Could not detect a user id. Example: "What is the balance of user 123?"';
  }
  const row = await getUserById(userId);
  if (!row) return `User ${userId} was not found.`;
  return `The balance of user ${userId} (${row.name}) is ${row.balance}.`;
}
