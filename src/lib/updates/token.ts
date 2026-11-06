import { createHash, randomBytes } from "node:crypto";

export type IssuedToken = Readonly<{
  token: string;
  hash: string;
}>;

export function issueToken(): IssuedToken {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
