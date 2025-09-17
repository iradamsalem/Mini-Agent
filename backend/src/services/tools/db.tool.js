// backend/src/services/tools/db.tool.js
import { getUserBalance } from '../../db/repositories/users.repo.js';

export async function dbTool(args = {}) {
  const id = Number(args.userId ?? args.id);
  if (!id) return 'Please specify a valid user id.';
  const bal = await getUserBalance(id);
  if (bal == null) return `No balance found for user ${id}.`;
  return `The current balance for user ${id} is $${bal}.`;
}
