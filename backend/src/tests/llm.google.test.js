import { describe, test, expect } from "@jest/globals";

import { classifyTool, llmAnswer } from "../services/llm/google.js";

describe("llm/google", () => {
  test("classifyTool: RAG keywords → rag", async () => {
    const out = await classifyTool("What is in the refund policy?");
    expect(out.tool).toBe("rag");
  });

  test("classifyTool: DB intent with id → db", async () => {
    const out = await classifyTool("What is the balance of user 123?");
    expect(out.tool).toBe("db");
    expect(out.tool_args?.userId).toBe(123);
  });

  test("classifyTool: Direct otherwise", async () => {
    const out = await classifyTool("Tell me something fun");
    expect(out.tool).toBe("direct");
  });

  test("llmAnswer returns deterministic test text", async () => {
    const txt = await llmAnswer("Hello?");
    expect(typeof txt).toBe("string");
    expect(txt).toContain("[test]");
  });
});
