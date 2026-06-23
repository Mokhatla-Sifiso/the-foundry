import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/admin";

/**
 * GDPR Article 17 (right to erasure). Hard-deletes the authenticated user, all
 * their sessions, BetterAuth accounts, their recruiter profile, and the
 * pre-login consent log entries that were keyed to their hashed clientId.
 * Cascade deletes are configured at the schema level for the cleanup.
 *
 * Whitelisted admin accounts cannot self-delete via this endpoint — admin
 * removal is a separate, deliberate operation via /api/admin/whitelist to
 * avoid accidentally locking the project out.
 */
export async function DELETE(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }
    if (ctx.isAdmin) {
      return NextResponse.json(
        {
          message:
            "Admin accounts can't be deleted from here. Remove the email from the admin whitelist first.",
        },
        { status: 403 },
      );
    }

    const hdrs = await headers();
    try {
      await auth.api.signOut({ headers: hdrs });
    } catch {
      // Even if signOut fails (e.g. cookie already gone) we still proceed with
      // the data wipe — the user has asked us to delete them.
    }

    await db.user.delete({ where: { id: ctx.userId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recruiter/account] delete failed", err);
    return NextResponse.json({ message: "Could not delete account." }, { status: 500 });
  }
}
