import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { isWhitelisted } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";
import { validateSignup } from "@/lib/auth/validation";
import { recruiterBypassAllows } from "@/lib/auth/bypass";
import { logConsent } from "@/lib/privacy/log";
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from "@/lib/privacy/policy";
import { rateLimit, clientIp } from "@/lib/rate-limit";
const OTP_RE = /^\d{6}$/;
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const otp = typeof payload?.otp === "string" ? payload.otp.trim() : "";
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });
    }
    const hdrs = await headers();
    if (!(await rateLimit("otp-verify", `ip:${clientIp(hdrs)}`))) {
      return NextResponse.json(
        { message: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const allowPersonalEmail = email
      ? (await isWhitelisted(email)) || recruiterBypassAllows(email)
      : false;
    const validation = validateSignup(payload, { allowPersonalEmail });
    if (!validation.ok) {
      return NextResponse.json(
        { message: validation.error.message, field: validation.error.field },
        { status: 400 },
      );
    }
    const { value } = validation;
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
    const now = new Date();
    await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: {
          name: value.name,
          emailVerified: true,
          acceptedTermsAt: now,
          acceptedPrivacyAt: now,
          acceptedTermsVer: TERMS_VERSION,
          acceptedPrivacyVer: PRIVACY_POLICY_VERSION,
        },
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
    await Promise.all([
      logConsent({
        userId: session.user.id,
        action: "accept_terms",
        payload: { version: TERMS_VERSION },
      }),
      logConsent({
        userId: session.user.id,
        action: "accept_privacy",
        payload: { version: PRIVACY_POLICY_VERSION },
      }),
    ]);
    const account = await fetchAccount(session.user.id);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/signup/verify]", err);
    return NextResponse.json({ message: "Could not finish sign-up." }, { status: 500 });
  }
}
