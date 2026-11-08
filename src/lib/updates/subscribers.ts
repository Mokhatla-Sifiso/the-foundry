import { db } from "@/lib/db";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy/policy";
import { linksFor, sendConfirmation } from "./email";
import { hashToken, issueToken } from "./token";

export const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;
export const PENDING_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export async function subscribe(email: string, now: Date = new Date()): Promise<void> {
  const existing = await db.updateSubscriber.findUnique({ where: { email } });
  if (existing?.status === "confirmed") return;

  const confirm = issueToken();
  const unsubscribe = issueToken();
  const fields = {
    confirmTokenHash: confirm.hash,
    confirmExpiresAt: new Date(now.getTime() + CONFIRM_TTL_MS),
    unsubscribeTokenHash: unsubscribe.hash,
    policyVersion: PRIVACY_POLICY_VERSION,
    consentedAt: now,
  };
  await db.updateSubscriber.upsert({
    where: { email },
    create: { email, status: "pending", ...fields },
    update: fields,
  });
  await sendConfirmation(email, linksFor(confirm.token, unsubscribe.token));
}

export type ConfirmOutcome = "confirmed" | "expired" | "invalid";

export async function confirm(token: string, now: Date = new Date()): Promise<ConfirmOutcome> {
  const row = await db.updateSubscriber.findUnique({
    where: { confirmTokenHash: hashToken(token) },
  });
  if (!row) return "invalid";
  if (!row.confirmExpiresAt || row.confirmExpiresAt.getTime() < now.getTime()) return "expired";
  await db.updateSubscriber.update({
    where: { id: row.id },
    data: { status: "confirmed", confirmedAt: now, confirmTokenHash: null, confirmExpiresAt: null },
  });
  return "confirmed";
}

export type UnsubscribeOutcome = "removed" | "invalid";

export async function unsubscribe(token: string): Promise<UnsubscribeOutcome> {
  const { count } = await db.updateSubscriber.deleteMany({
    where: { unsubscribeTokenHash: hashToken(token) },
  });
  return count > 0 ? "removed" : "invalid";
}

export async function purgeStalePending(now: Date = new Date()): Promise<number> {
  const { count } = await db.updateSubscriber.deleteMany({
    where: { status: "pending", updatedAt: { lt: new Date(now.getTime() - PENDING_RETENTION_MS) } },
  });
  return count;
}
