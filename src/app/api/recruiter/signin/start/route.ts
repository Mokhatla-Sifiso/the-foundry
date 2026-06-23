import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { isWhitelisted } from "@/lib/auth/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign-in start. Refuses to send an OTP unless one of:
 *   - the email already has a user account, OR
 *   - the email is on the admin whitelist (admins can sign in even before
 *     their first manual visit since their access is pre-trusted).
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    const [user, admin] = await Promise.all([
      db.user.findUnique({ where: { email } }),
      isWhitelisted(email),
    ]);

    if (!user && !admin) {
      return NextResponse.json(
        { message: "No access found for that email. Request access instead." },
        { status: 404 },
      );
    }

    const hdrs = await headers();
    await auth.api.sendVerificationOTP({
      body: { email, type: "sign-in" },
      headers: hdrs,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recruiter/signin/start]", err);
    return NextResponse.json({ message: "Could not send code." }, { status: 500 });
  }
}
