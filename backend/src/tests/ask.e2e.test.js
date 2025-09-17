import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";

// ---- Mocks (ESM): להכריז לפני ה-import של app.js ----
const ragMock = {
  answer:
    "[mock] Refunds are available within 30 days if the product is unused.",
  sources: [{ id: 1, snippet: "Refund Policy ...", distance: 0.41 }],
  used: "rag:hit",
};

// ✅ עדכון נתיבים לפי המבנה שלך בתוך services/
jest.unstable_mockModule("../services/tools/rag.tool.js", () => ({
  ragTool: jest.fn(async () => ({ ...ragMock })),
}));

jest.unstable_mockModule("../services/tools/db.tool.js", () => ({
  dbTool: jest.fn(async ({ userId }) => {
    if (userId == null) {
      return 'Could not detect a user id. Example: "What is the balance of user 123?"';
    }
    if (userId === 999) return "User 999 was not found.";
    return `The balance of user ${userId} (Alice) is 250.`;
  }),
}));

// ⚠️ חשוב: לייבא את האפליקציה רק אחרי רישום המוקים (Top-Level Await)
const { default: app } = await import("../app.js");

describe("/api/ask", () => {
  test("rejects non-English input", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ query: "מה היתרה של המשתמש 123?" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/English only/i);
  });

  test("RAG: refund policy → tool = rag + sources", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ query: "What is covered in the refund policy?" });

    expect(res.statusCode).toBe(200);
    expect(res.body.tool).toBe("rag");
    expect(Array.isArray(res.body.sources)).toBe(true);
    expect(res.body.sources.length).toBeGreaterThanOrEqual(1);
    expect(res.body.answer).toMatch(/refunds? are available/i);
  });

  test("DB: balance of user 123 → tool = db", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ query: "What is the balance of user 123?" });

    expect(res.statusCode).toBe(200);
    expect(res.body.tool).toBe("db");
    expect(res.body.answer).toMatch(/balance/i);
    expect(res.body.answer).toMatch(/123/);
  });

  test("DB: missing user id handled (may fall back to direct in TEST_MODE)", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ query: "What is the balance?" });

    expect(res.statusCode).toBe(200);
    if (res.body.tool === "db") {
      expect(res.body.answer).toMatch(/detect a user id/i);
    } else {
      expect(res.body.tool).toBe("direct");
      expect(typeof res.body.answer).toBe("string");
    }
  });

  test("Direct: joke → tool = direct", async () => {
    const res = await request(app)
      .post("/api/ask")
      .send({ query: "Tell me a short database joke" });

    expect(res.statusCode).toBe(200);
    expect(res.body.tool).toBe("direct");
    expect(typeof res.body.answer).toBe("string");
  });
});
