import { agentService } from '../services/agent.service.js';

export async function askController(req, res, next) {
  try {
    const { query } = req.validated ?? req.body ?? {};
    if (!query) return res.status(400).json({ error: 'Missing "query"' });
    const result = await agentService.handleQuery(query);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
