import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "./server";

export type SessionContext = {
  userId: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

export async function isWhitelisted(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const entry = await db.adminWhitelist.findUnique({ where: { email: normalized } });
  return entry !== null;
}

/**
 * Resolve the current BetterAuth session into a typed context that includes
 * whether the user is on the admin whitelist. Returns null if not signed in.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const hdrs = await headers();
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session?.user) return null;
  const isAdmin = await isWhitelisted(session.user.email);
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name ?? "",
    isAdmin,
  };
}

export async function requireAdmin(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) throw new HttpError(401, "Sign in required");
  if (!ctx.isAdmin) throw new HttpError(403, "Admin access required");
  return ctx;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
