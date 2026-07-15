import { newReviewToken } from "@/lib/access/token";

describe("newReviewToken", () => {
  it("returns a non-empty base64url string", () => {
    const token = newReviewToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it("encodes 24 random bytes as 32 unpadded base64url characters", () => {
    expect(newReviewToken()).toHaveLength(32);
    expect(newReviewToken()).not.toContain("=");
  });
  it("produces a distinct value on every call", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => newReviewToken()));
    expect(tokens.size).toBe(100);
  });
});
