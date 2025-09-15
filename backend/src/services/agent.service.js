import { classifyTool, llmAnswer } from './llm/google.js';
import { ragTool } from './tools/rag.tool.js';
import { dbTool } from './tools/db.tool.js';

export const agentService = {
  async handleQuery(query) {
    // 1) החלטה ע"י LLM
    const { tool, tool_args } = await classifyTool(query);
    // 2) הרצת הכלי
    if (tool === 'rag') {
      const { answer, sources } = await ragTool(query);
      return { tool, answer, sources };
    }
    if (tool === 'db') {
      const answer = await dbTool(tool_args); // למשל { userId: 123 }
      return { tool, answer };
    }
    // 3) תשובה ישירה
    const answer = await llmAnswer(query);
    return { tool: 'direct', answer };
  }
};
