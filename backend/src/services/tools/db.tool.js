import { getUserBalance } from '../../db/repositories/users.repo.js';

export async function dbTool(args = {}) {
  const id = Number(args.userId ?? args.id);
  if (!id) return 'Missing userId';
  const bal = await getUserBalance(id);
  return `The current balance for user ${id} is $${bal}.`;
}
