import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { isWhitelisted } from "@/lib/auth/admin";
import { validateSignup } from "@/lib/auth/validation";
import { recruiterBypassAllows } from "@/lib/auth/bypass";
import { rateLimit, clientIp } from "@/lib/rate-limit";
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const hdrs = await headers();
    const ip = clientIp(hdrs);
    const allowed =
      (await rateLimit("otp-send", `ip:${ip}`)) &&
      (!email || (await rateLimit("otp-send", `email:${email}`)));
    if (!allowed) {
      return NextResponse.json(
        { message: "Too many code requests. Please wait a few minutes and try again." },
        { status: 429 },
      );
    }
    const allowPersonalEmail = email
      ? (await isWhitelisted(email)) || recruiterBypassAllows(email)
      : false;
    const result = validateSignup(payload, { allowPersonalEmail });
    if (!result.ok) {
      return NextResponse.json(
        { message: result.error.message, field: result.error.field },
        { status: 400 },
      );
    }
    await auth.api.sendVerificationOTP({
      body: { email: result.value.email, type: "sign-in" },
      headers: hdrs,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send code.";
    console.error("[recruiter/signup/start]", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
