import { randomBytes } from "node:crypto";

export function newReviewToken(): string {
  return randomBytes(24).toString("base64url");
}
