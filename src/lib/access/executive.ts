import { db } from "@/lib/db";
import { sendExecutiveDemoToOwner, sendExecutiveRepoToOwner, sendExecutiveReceipt } from "./email";
import { notifyOwner } from "./notify";
import { newReviewToken } from "./token";

export type ExecutiveRequests = Readonly<{
  demo: boolean;
  repo: boolean;
}>;

export type ExecutiveKind = "demo" | "repo";

export type PendingExecutive = Readonly<{
  kind: ExecutiveKind;
  name: string;
  email: string;
  slot: string;
  topic: string;
  repos: string;
  purpose: string;
  message: string | null;
  createdAt: Date;
}>;

export async function createDemoRequest(args: {
  email: string;
  name: string;
  slot: string;
  topic: string;
  message: string;
  ip: string | null;
  ua: string | null;
}): Promise<void> {
  const token = newReviewToken();
  await db.accessRequest.create({
    data: {
      email: args.email,
      name: args.name,
      tier: "executive",
      kind: "demo",
      detail: { slot: args.slot, topic: args.topic },
      message: args.message || null,
      status: "pending",
      reviewToken: token,
      ipAddress: args.ip,
      userAgent: args.ua,
    },
  });
  await notifyOwner(
    "executive/demo",
    args.email,
    sendExecutiveDemoToOwner({
      name: args.name,
      email: args.email,
      slot: args.slot,
      topic: args.topic,
      message: args.message,
      token,
    }),
    sendExecutiveReceipt(args.email, args.name, "demo"),
  );
}

export async function createRepoRequest(args: {
  email: string;
  name: string;
  repos: string;
  purpose: string;
  message: string;
  ip: string | null;
  ua: string | null;
}): Promise<void> {
  const token = newReviewToken();
  await db.accessRequest.create({
    data: {
      email: args.email,
      name: args.name,
      tier: "executive",
      kind: "repo",
      detail: { repos: args.repos, purpose: args.purpose },
      message: args.message || null,
      status: "pending",
      reviewToken: token,
      ipAddress: args.ip,
      userAgent: args.ua,
    },
  });
  await notifyOwner(
    "executive/repo",
    args.email,
    sendExecutiveRepoToOwner({
      name: args.name,
      email: args.email,
      repos: args.repos,
      purpose: args.purpose,
      message: args.message,
      token,
    }),
    sendExecutiveReceipt(args.email, args.name, "repo"),
  );
}

export async function executiveRequestsForEmail(email: string): Promise<ExecutiveRequests> {
  const rows = await db.accessRequest.findMany({
    where: { email, tier: "executive" },
    select: { kind: true },
  });
  return {
    demo: rows.some((r) => r.kind === "demo"),
    repo: rows.some((r) => r.kind === "repo"),
  };
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function pendingExecutiveByToken(token: string): Promise<PendingExecutive | null> {
  const req = await db.accessRequest.findUnique({ where: { reviewToken: token } });
  if (!req || req.tier !== "executive" || req.status !== "pending") return null;
  const detail = (req.detail ?? {}) as Record<string, unknown>;
  return {
    kind: req.kind === "repo" ? "repo" : "demo",
    name: req.name,
    email: req.email,
    slot: str(detail.slot),
    topic: str(detail.topic),
    repos: str(detail.repos),
    purpose: str(detail.purpose),
    message: req.message,
    createdAt: req.createdAt,
  };
}

/**
 * Executive requests are acknowledged, not granted: accepting marks the row so it
 * leaves the queue and the link stops working. Nothing is emailed to the requester
 * and no access is unlocked, because the follow-up here is a real conversation.
 */
export async function reviewExecutiveRequest(
  token: string,
  action: "approve" | "reject",
): Promise<{ ok: boolean; message: string }> {
  const req = await db.accessRequest.findUnique({ where: { reviewToken: token } });
  if (!req || req.tier !== "executive") {
    return { ok: false, message: "This link is invalid or has already been used." };
  }
  if (req.status !== "pending") {
    return { ok: false, message: `This request was already ${req.status}.` };
  }
  const what = req.kind === "repo" ? "repo access request" : "demo request";
  await db.accessRequest.update({
    where: { id: req.id },
    data: {
      status: action === "approve" ? "approved" : "rejected",
      decidedAt: new Date(),
      reviewToken: null,
    },
  });
  return action === "approve"
    ? { ok: true, message: `Marked ${req.name}'s ${what} as handled.` }
    : { ok: true, message: `Declined ${req.name}'s ${what}.` };
}
