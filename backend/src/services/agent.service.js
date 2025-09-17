// src/services/agent.service.js
import { classifyTool, llmAnswer } from './llm/google.js';
import { ragTool } from './tools/rag.tool.js';
import { dbTool } from './tools/db.tool.js';

export const agentService = {
  async handleQuery(query) {
    const { tool, tool_args } = await classifyTool(query);

    if (tool === 'rag') {
      const { answer, sources, used } = await ragTool(query, { minScore: 0.68, k: 8 });
      if (!answer) {
        const fallback = await llmAnswer(query);
        return { tool: 'direct', answer: fallback, note: used }; // rag:no_hit
      }
      return { tool, answer, sources };
    }

    if (tool === 'db') {
      const answer = await dbTool(tool_args ?? {});
      return { tool, answer };
    }

    const answer = await llmAnswer(query);
    return { tool: 'direct', answer };
  }
};
