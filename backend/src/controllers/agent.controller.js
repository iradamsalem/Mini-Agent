import { agentService } from '../services/agent.service.js';

export async function askController(req, res, next) {
  try {
    const query = (req.validated?.query ?? req.body?.query ?? '').trim();
    if (!query) return res.status(400).json({ error: 'Missing "query"' });

    // English-only gate (inline, no separate middleware):
    if (/[^\x00-\x7F]/.test(query)) {
      return res.status(400).json({
        error: 'Please ask in English only.',
        note: 'non_english_input_detected'
      });
    }

    const result = await agentService.handleQuery(query);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
