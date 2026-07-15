import { db } from "@/lib/db";
import {
  sendExecutiveDemoToOwner,
  sendExecutiveRepoToOwner,
  sendExecutiveReceipt,
} from "./email";

export type ExecutiveRequests = Readonly<{
  demo: boolean;
  repo: boolean;
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
  await db.accessRequest.create({
    data: {
      email: args.email,
      name: args.name,
      tier: "executive",
      kind: "demo",
      detail: { slot: args.slot, topic: args.topic },
      message: args.message || null,
      status: "pending",
      ipAddress: args.ip,
      userAgent: args.ua,
    },
  });
  await Promise.all([
    sendExecutiveDemoToOwner({
      name: args.name,
      email: args.email,
      slot: args.slot,
      topic: args.topic,
      message: args.message,
    }),
    sendExecutiveReceipt(args.email, args.name, "demo"),
  ]);
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
  await db.accessRequest.create({
    data: {
      email: args.email,
      name: args.name,
      tier: "executive",
      kind: "repo",
      detail: { repos: args.repos, purpose: args.purpose },
      message: args.message || null,
      status: "pending",
      ipAddress: args.ip,
      userAgent: args.ua,
    },
  });
  await Promise.all([
    sendExecutiveRepoToOwner({
      name: args.name,
      email: args.email,
      repos: args.repos,
      purpose: args.purpose,
      message: args.message,
    }),
    sendExecutiveReceipt(args.email, args.name, "repo"),
  ]);
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
