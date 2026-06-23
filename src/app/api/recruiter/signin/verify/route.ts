import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { isWhitelisted } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { fetchAccount } from "@/lib/auth/profile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const otp = typeof payload?.otp === "string" ? payload.otp.trim() : "";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });
    }

    const hdrs = await headers();
    let session;
    try {
      session = await auth.api.signInEmailOTP({
        body: { email, otp },
        headers: hdrs,
        asResponse: false,
      });
    } catch (err) {
      const message =
        err instanceof Error && /expired|invalid|attempt/i.test(err.message)
          ? "That code doesn't match. Try again."
          : "Could not verify the code. Try again.";
      return NextResponse.json({ message }, { status: 401 });
    }
    if (!session?.user?.id) {
      return NextResponse.json({ message: "That code doesn't match. Try again." }, { status: 401 });
    }

    // First-time admin sign-in: seed the user.name from the whitelist entry.
    const admin = await isWhitelisted(email);
    if (admin) {
      const whitelist = await db.adminWhitelist.findUnique({ where: { email } });
      if (whitelist && session.user.name !== whitelist.name) {
        await db.user.update({
          where: { id: session.user.id },
          data: { name: whitelist.name, emailVerified: true },
        });
      }
    }

    const account = await fetchAccount(session.user.id);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/signin/verify]", err);
    return NextResponse.json({ message: "Could not finish sign-in." }, { status: 500 });
  }
}
