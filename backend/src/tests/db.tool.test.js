import { jest, describe, test, expect } from "@jest/globals";

jest.unstable_mockModule("../db/repositories/users.repo.js", () => ({
  getUserById: jest.fn(async (id) => {
    if (id === 123) return { id: 123, name: "Alice", balance: 250 };
    if (id === 999) return null;
    return { id, name: "Test", balance: 0 };
  }),
}));

const { dbTool } = await import("../services/tools/db.tool.js");

describe("db.tool", () => {
  test("missing user id", async () => {
    const out = await dbTool({ userId: null });
    expect(out).toMatch(/detect a user id/i);
  });

  test("existing user", async () => {
    const out = await dbTool({ userId: 123 });
    expect(out).toMatch(/Alice/);
    expect(out).toMatch(/250/);
  });

  test("non-existing user", async () => {
    const out = await dbTool({ userId: 999 });
    expect(out).toMatch(/was not found/i);
  });
});
