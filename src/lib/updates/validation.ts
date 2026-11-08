import { normalizeEmail } from "@/lib/auth/validation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** RFC 5321 limit on a forward path, so a stored address is always deliverable. */
export const MAX_EMAIL_LENGTH = 254;

export type SubscribeInput =
  | Readonly<{ ok: true; email: string }>
  /** The honeypot was filled: answer as if accepted, store and send nothing. */
  | Readonly<{ ok: true; bot: true }>
  | Readonly<{ ok: false; field: "email" | "consent"; message: string }>;

/** Validates a subscribe request body (spec UG 7.1). */
export function parseSubscribe(raw: unknown): SubscribeInput {
  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: true, bot: true };
  }
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    return { ok: false, field: "email", message: "Enter an email address like name@company.com." };
  }
  if (body.consent !== true) {
    return {
      ok: false,
      field: "consent",
      message: "Tick the box so I can send you the launch email.",
    };
  }
  return { ok: true, email };
}

/** A link token as it arrives in a form or query string: base64url of 32 bytes, nothing else. */
export function parseToken(raw: unknown): string | null {
  return typeof raw === "string" && /^[A-Za-z0-9_-]{43}$/.test(raw) ? raw : null;
}
