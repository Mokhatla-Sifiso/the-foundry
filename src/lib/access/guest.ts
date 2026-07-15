import { db } from "@/lib/db";
import { newReviewToken } from "./token";
import { GUEST_GRANT_DAYS } from "./resources";
import { sendGuestRequestToOwner, sendGuestReceipt, sendGuestDecision } from "./email";

export type GuestStatus = "none" | "pending" | "approved" | "rejected" | "expired";

export type GuestState = Readonly<{
  status: GuestStatus;
  expiresAt: number | null;
  resources: ReadonlyArray<string>;
}>;

export async function createGuestRequest(args: {
  email: string;
  name: string;
  resources: ReadonlyArray<string>;
  message: string;
  ip: string | null;
  ua: string | null;
}): Promise<void> {
  const token = newReviewToken();
  await db.accessRequest.create({
    data: {
      email: args.email,
      name: args.name,
      tier: "guest",
      kind: "resource",
      detail: { resources: args.resources },
      message: args.message || null,
      status: "pending",
      reviewToken: token,
      ipAddress: args.ip,
      userAgent: args.ua,
    },
  });
  await Promise.all([
    sendGuestRequestToOwner({
      name: args.name,
      email: args.email,
      resources: args.resources,
      message: args.message,
      token,
    }),
    sendGuestReceipt(args.email, args.name),
  ]);
}

export async function guestStateForEmail(email: string): Promise<GuestState> {
  const latest = await db.accessRequest.findFirst({
    where: { email, tier: "guest" },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return { status: "none", expiresAt: null, resources: [] };
  const detail = (latest.detail ?? {}) as { resources?: unknown };
  const resources = Array.isArray(detail.resources)
    ? detail.resources.filter((r): r is string => typeof r === "string")
    : [];
  const expiresAt = latest.expiresAt?.getTime() ?? null;
  if (latest.status === "approved" && expiresAt !== null && expiresAt < Date.now()) {
    return { status: "expired", expiresAt, resources };
  }
  return { status: latest.status as GuestStatus, expiresAt, resources };
}

export async function reviewGuestRequest(
  token: string,
  action: "approve" | "reject",
): Promise<{ ok: boolean; message: string }> {
  const req = await db.accessRequest.findUnique({ where: { reviewToken: token } });
  if (!req) return { ok: false, message: "This link is invalid or has already been used." };
  if (req.status !== "pending") {
    return { ok: false, message: `This request was already ${req.status}.` };
  }
  const now = new Date();
  if (action === "approve") {
    const expiresAt = new Date(now.getTime() + GUEST_GRANT_DAYS * 24 * 60 * 60 * 1000);
    await db.accessRequest.update({
      where: { id: req.id },
      data: { status: "approved", decidedAt: now, expiresAt, reviewToken: null },
    });
    await sendGuestDecision(req.email, req.name, true, expiresAt);
    return { ok: true, message: `Approved. ${req.name} now has 30-day access.` };
  }
  await db.accessRequest.update({
    where: { id: req.id },
    data: { status: "rejected", decidedAt: now, reviewToken: null },
  });
  await sendGuestDecision(req.email, req.name, false);
  return { ok: true, message: `Rejected ${req.name}'s request.` };
}

export async function pendingRequestByToken(token: string): Promise<{
  name: string;
  email: string;
  resources: ReadonlyArray<string>;
  message: string | null;
} | null> {
  const req = await db.accessRequest.findUnique({ where: { reviewToken: token } });
  if (!req || req.status !== "pending") return null;
  const detail = (req.detail ?? {}) as { resources?: unknown };
  const resources = Array.isArray(detail.resources)
    ? detail.resources.filter((r): r is string => typeof r === "string")
    : [];
  return { name: req.name, email: req.email, resources, message: req.message };
}
