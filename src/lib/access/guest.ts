import { db } from "@/lib/db";
import { newReviewToken } from "./token";
import { GUEST_GRANT_HOURS } from "./resources";
import { sendGuestRequestToOwner, sendGuestReceipt, sendGuestDecision } from "./email";

export type GuestStatus = "none" | "pending" | "approved" | "rejected" | "expired";

export type GuestState = Readonly<{
  status: GuestStatus;
  expiresAt: number | null;
  resources: ReadonlyArray<string>;
}>;

/** The request row was saved, but the owner could not be told it exists. */
export class GuestNotifyError extends Error {
  constructor() {
    super("Your request was saved, but the notification email failed to send.");
    this.name = "GuestNotifyError";
  }
}

async function notify(args: {
  email: string;
  name: string;
  resources: ReadonlyArray<string>;
  message: string;
  token: string;
}): Promise<void> {
  const [owner, receipt] = await Promise.allSettled([
    sendGuestRequestToOwner({
      name: args.name,
      email: args.email,
      resources: args.resources,
      message: args.message,
      token: args.token,
    }),
    sendGuestReceipt(args.email, args.name),
  ]);
  // The receipt is a courtesy. Losing it must never cost us the owner notification,
  // which is the only thing that surfaces a pending request for review.
  if (receipt.status === "rejected") {
    console.error(`[guest] receipt to ${args.email} failed:`, receipt.reason);
  }
  if (owner.status === "rejected") {
    console.error(`[guest] owner notification for ${args.email} failed:`, owner.reason);
    throw new GuestNotifyError();
  }
}

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
  await notify({ ...args, token });
}

/**
 * Re-send the owner notification for an existing pending request, reusing its
 * review token. Without this a resubmission reports "pending" and quietly does
 * nothing, stranding the request forever if the first notification failed.
 */
export async function renotifyPendingRequest(email: string): Promise<void> {
  const req = await db.accessRequest.findFirst({
    where: { email, tier: "guest", status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  if (!req?.reviewToken) return;
  const detail = (req.detail ?? {}) as { resources?: unknown };
  const resources = Array.isArray(detail.resources)
    ? detail.resources.filter((r): r is string => typeof r === "string")
    : [];
  await notify({
    email: req.email,
    name: req.name,
    resources,
    message: req.message ?? "",
    token: req.reviewToken,
  });
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
    const expiresAt = new Date(now.getTime() + GUEST_GRANT_HOURS * 60 * 60 * 1000);
    await db.accessRequest.update({
      where: { id: req.id },
      data: { status: "approved", decidedAt: now, expiresAt, reviewToken: null },
    });
    await sendGuestDecision(req.email, req.name, true, expiresAt);
    return { ok: true, message: `Approved. ${req.name} now has ${GUEST_GRANT_HOURS}-hour access.` };
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
