import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getSessionContext } from "@/lib/auth/admin";
import { revokeUserSessions } from "@/lib/auth/sessions";

export async function POST(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }
    const revoked = await revokeUserSessions(ctx.userId);
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
