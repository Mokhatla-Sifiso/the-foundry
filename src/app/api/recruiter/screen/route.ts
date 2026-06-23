import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";

/**
 * Lightweight server-side screening. For now every authenticated recruiter
 * is auto-approved (the heavy domain/company verification is a follow-up).
 * Admins on the whitelist already short-circuit to "approve" inside
 * fetchAccount, but we still want to write the verifiedAt timestamp on
 * their profile if they happen to have one.
 */
export async function POST(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return NextResponse.json({ message: "Sign in required." }, { status: 401 });

    const existing = await db.recruiterProfile.findUnique({ where: { userId: ctx.userId } });
    if (existing) {
      await db.recruiterProfile.update({
        where: { userId: ctx.userId },
        data: {
          decision: "approve",
          reason: ctx.isAdmin ? "Admin allowlist." : "Verified via work email and domain.",
          verifiedAt: new Date(),
        },
      });
    }

    const account = await fetchAccount(ctx.userId);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/screen]", err);
    return NextResponse.json({ message: "Screening failed." }, { status: 500 });
  }
}
