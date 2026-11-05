import { createHash } from "node:crypto";
import { hashToken, issueToken } from "@/lib/updates/token";
import { parseToken } from "@/lib/updates/validation";

describe("updates tokens", () => {
  it("issues 32 random bytes as base64url with a SHA-256 hex hash", () => {
    const { token, hash } = issueToken();
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never repeats a token", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => issueToken().token));
    expect(tokens.size).toBe(200);
  });

  it("hashes deterministically, so a link can be matched to its stored hash", () => {
    const { token, hash } = issueToken();
    expect(hashToken(token)).toBe(hash);
    expect(hashToken(`${token}x`)).not.toBe(hash);
  });

  it("accepts only well-formed tokens from links and forms", () => {
    const { token } = issueToken();
    expect(parseToken(token)).toBe(token);
    for (const bad of [
      undefined,
      null,
      42,
      "",
      "short",
      `${token}=`,
      `${token.slice(1)}+`,
      " ".repeat(43),
    ]) {
      expect(parseToken(bad)).toBeNull();
    }
  });
});
