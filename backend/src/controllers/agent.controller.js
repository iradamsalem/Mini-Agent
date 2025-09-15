import { agentService } from '../services/agent.service.js';

export const askController = async (req, res, next) => {
  try {
    const { query } = req.validated;
    const result = await agentService.handleQuery(query);
    res.json(result); // { tool, answer, sources? }
  } catch (err) { next(err); }
};
