import { describe, test, expect } from "@jest/globals";
import { answerWithContext } from "../services/retrieval/answerWithContext.js";

describe("answerWithContext (TEST_MODE)", () => {
  test("uses first chunk when present", async () => {
    const chunks = [{ text: "Refunds are available within 30 days if unused." }];
    const { answer } = await answerWithContext("refunds?", chunks);
    expect(answer).toMatch(/\[test\]/);      // מציין שזה מצב טסט
    expect(answer).toMatch(/Refunds are available/i);
  });

  test("no chunks → I don't know", async () => {
    const { answer } = await answerWithContext("anything", []);
    expect(answer).toMatch(/I don't know/i);
  });
});
