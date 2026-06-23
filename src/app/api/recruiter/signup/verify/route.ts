import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { isWhitelisted } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";
import { validateSignup } from "@/lib/auth/validation";

const OTP_RE = /^\d{6}$/;

/**
 * Finish the recruiter sign-up flow:
 *   1. Re-validate the form payload server-side (never trust client state).
 *   2. Hand the OTP to BetterAuth's sign-in.email-otp — this creates the user
 *      if needed and sets the session cookie via the `nextCookies` plugin.
 *   3. Persist the recruiter profile + the user's display name in one txn.
 *   4. Return the typed account.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const otp = typeof payload?.otp === "string" ? payload.otp.trim() : "";
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });
    }

    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const adminGate = email ? await isWhitelisted(email) : false;
    const validation = validateSignup(payload, { isAdmin: adminGate });
    if (!validation.ok) {
      return NextResponse.json(
        { message: validation.error.message, field: validation.error.field },
        { status: 400 },
      );
    }
    const { value } = validation;

    const hdrs = await headers();
    let session;
    try {
      session = await auth.api.signInEmailOTP({
        body: { email: value.email, otp },
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

    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { name: value.name, emailVerified: true },
      }),
      db.recruiterProfile.upsert({
        where: { userId: session.user.id },
        update: {
          company: value.company,
          role: value.role,
          url: value.url,
        },
        create: {
          userId: session.user.id,
          company: value.company,
          role: value.role,
          url: value.url,
        },
      }),
    ]);

    const account = await fetchAccount(session.user.id);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/signup/verify]", err);
    return NextResponse.json({ message: "Could not finish sign-up." }, { status: 500 });
  }
}
