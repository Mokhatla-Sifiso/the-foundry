import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HttpError, requireAdmin } from "@/lib/auth/admin";
import { revokeUserSessions } from "@/lib/auth/sessions";

/** Owner-only: boot a specific account off every device by email. */
export async function POST(request: Request): Promise<Response> {
  try {
    await requireAdmin();
    const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      throw new HttpError(400, "A valid email is required.");
    }
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      // Don't reveal whether the address exists; nothing to revoke either way.
      return NextResponse.json({ ok: true, revoked: 0 });
    }
    const revoked = await revokeUserSessions(user.id);
    return NextResponse.json({ ok: true, revoked });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    console.error("[admin/sessions/revoke]", err);
    return NextResponse.json({ message: "Could not revoke sessions." }, { status: 500 });
  }
}
