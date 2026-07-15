import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

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
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[${tag}]`, err);
    return NextResponse.json({ message: "Could not verify the code." }, { status: 500 });
  }
}
