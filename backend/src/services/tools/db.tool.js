import { getUserById } from '../../db/repositories/users.repo.js';

export async function dbTool({ userId }) {
  if (userId === null || typeof userId === 'undefined') {
    return 'Could not detect a user id. Example: "What is the balance of user 123?"';
  }
  const row = await getUserById(userId);
  if (!row) return `User ${userId} was not found.`;
  return `The balance of user ${userId} (${row.name}) is ${row.balance}.`;
}
