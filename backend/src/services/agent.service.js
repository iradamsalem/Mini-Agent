// src/services/agent.service.js
import { classifyTool, llmAnswer } from './llm/google.js';
import { ragTool } from './tools/rag.tool.js';
import { dbTool } from './tools/db.tool.js';

/**
 * Service responsible for handling user queries by selecting the appropriate tool.
 *
 * Workflow:
 * 1. Uses `classifyTool` to determine which tool should process the query.
 * 2. If tool = "rag", attempts semantic retrieval and contextual answering:
 *    - Falls back to `llmAnswer` if no relevant chunks are found (`rag:no_hit`).
 * 3. If tool = "db", uses `dbTool` to retrieve user balance.
 * 4. Otherwise, defaults to `llmAnswer` (direct answer).
 *
 * @typedef {Object} AgentResponse
 * @property {'rag'|'db'|'direct'} tool - The tool used to generate the response.
 * @property {string} answer - The generated answer text.
 * @property {Array<{id:number,title:string,chunkIndex:number,text:string,distance:number}>} [sources] - Included when tool = "rag".
 * @property {string} [note] - Extra metadata (e.g., `rag:no_hit` when fallback was triggered).
 */
export const agentService = {
  /**
   * Handles a user query end-to-end by classifying and routing it to the correct tool.
   *
   * @async
   * @param {string} query - The user's question.
   * @returns {Promise<AgentResponse>} The final response object with tool, answer, and optionally sources/note.
   */
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
