import { createHash, randomBytes } from "node:crypto";

export type IssuedToken = Readonly<{
  /** Goes in the link sent to the subscriber; never stored. */
  token: string;
  /** What the database keeps: SHA-256 of the token, hex. */
  hash: string;
}>;

/** A link token: 32 random bytes, base64url. Only its hash is ever persisted (spec UG, section 6). */
export function issueToken(): IssuedToken {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
