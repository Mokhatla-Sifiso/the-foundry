import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { logConsent } from "@/lib/privacy/log";
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from "@/lib/privacy/policy";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

/** Both agreements must be ticked explicitly; anything but `true` is a refusal. */
export function hasAcceptedAgreements(payload: unknown): boolean {
  const input = (payload ?? {}) as Record<string, unknown>;
  return input.acceptedTerms === true && input.acceptedPrivacy === true;
}

const CONSENT_REQUIRED = {
  message: "Please accept the Terms of Use and the Privacy Policy to continue.",
  field: "consent",
} as const;

export async function startOtp(request: Request, tag: string): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (name.length < 2) {
      return NextResponse.json({ message: "Please enter your name." }, { status: 400 });
    }
    // Gate before any code is sent: consent is the price of entry, not an
    // afterthought once they already hold a one-time code.
    if (!hasAcceptedAgreements(payload)) {
      return NextResponse.json(CONSENT_REQUIRED, { status: 400 });
    }
    const hdrs = await headers();
    const ip = clientIp(hdrs);
    const allowed =
      (await rateLimit("otp-send", `ip:${ip}`)) && (await rateLimit("otp-send", `email:${email}`));
    if (!allowed) {
      return NextResponse.json(
        { message: "Too many code requests. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }
    await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" }, headers: hdrs });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[${tag}]`, err);
    return NextResponse.json({ message: "Could not send code." }, { status: 500 });
  }
}

export async function verifyOtp(request: Request, tag: string): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const otp = typeof payload?.otp === "string" ? payload.otp.trim() : "";
    const name = typeof payload?.name === "string" ? payload.name.trim() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (!OTP_RE.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });
    }
    // Re-asserted here so every issued session has a matching consent record,
    // even if someone replays a code straight against this endpoint.
    if (!hasAcceptedAgreements(payload)) {
      return NextResponse.json(CONSENT_REQUIRED, { status: 400 });
    }
    const hdrs = await headers();
    if (!(await rateLimit("otp-verify", `ip:${clientIp(hdrs)}`))) {
      return NextResponse.json(
        { message: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }
    let session: Awaited<ReturnType<typeof auth.api.signInEmailOTP>>;
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
    if (name && session.user.name !== name) {
      await db.user
        .update({ where: { id: session.user.id }, data: { name, emailVerified: true } })
        .catch(() => undefined);
    }
    // Proof of consent, tied to the user so it also surfaces in their DSAR export.
    await Promise.all([
      logConsent({
        userId: session.user.id,
        action: "accept_terms",
        payload: { version: TERMS_VERSION, journey: tag },
      }),
      logConsent({
        userId: session.user.id,
        action: "accept_privacy",
        payload: { version: PRIVACY_POLICY_VERSION, journey: tag },
      }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[${tag}]`, err);
    return NextResponse.json({ message: "Could not verify the code." }, { status: 500 });
  }
}
