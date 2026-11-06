import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getSessionContext } from "@/lib/auth/admin";
import { revokeUserSessions } from "@/lib/auth/sessions";

/** Sign the current user out of every device, including this one. */
export async function POST(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }
    const revoked = await revokeUserSessions(ctx.userId);
    // Clear this device's cookie too; the session row is already gone, so this is
    // best-effort and must not fail the request if there's nothing left to clear.
    try {
      await auth.api.signOut({ headers: await headers() });
    } catch {
      /* already revoked above */
    }
    return NextResponse.json({ ok: true, revoked });
  } catch (err) {
    console.error("[recruiter/signout-all]", err);
    return NextResponse.json({ message: "Could not sign out everywhere." }, { status: 500 });
  }
}
