import { db } from "@/lib/db";
import type { SessionContext } from "@/lib/auth/admin";
import { guestStateForEmail } from "./guest";

export type CvGrant = "admin" | "recruiter" | "guest" | null;

export async function cvGrantFor(ctx: SessionContext): Promise<CvGrant> {
  if (ctx.isAdmin) return "admin";

  const profile = await db.recruiterProfile.findUnique({
    where: { userId: ctx.userId },
    select: { decision: true },
  });
  if (profile?.decision === "approve") return "recruiter";

  const guest = await guestStateForEmail(ctx.email);
  if (guest.status === "approved" && guest.resources.includes("cv")) return "guest";

  return null;
}
