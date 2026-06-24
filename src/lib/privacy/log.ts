import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { COOKIE_POLICY_VERSION } from "./policy";
export type ConsentActionKind = "grant" | "withdraw" | "update" | "accept_terms" | "accept_privacy";
function hashedClientId(ip: string | null, ua: string | null): string {
  return createHash("sha256")
    .update(`${ip ?? "unknown"}|${ua ?? "unknown"}`)
    .digest("hex");
}
export async function logConsent(args: {
  userId?: string | null;
  action: ConsentActionKind;
  payload: unknown;
}): Promise<void> {
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? null;
  const ua = hdrs.get("user-agent");
  await db.consentLog.create({
    data: {
      userId: args.userId ?? null,
      clientId: args.userId ? null : hashedClientId(ip, ua),
      action: args.action,
      payload: args.payload as object,
      policyVer: COOKIE_POLICY_VERSION,
      ipAddress: ip ?? null,
      userAgent: ua ?? null,
    },
  });
}
