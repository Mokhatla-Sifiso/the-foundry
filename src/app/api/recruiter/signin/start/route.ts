import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { isWhitelisted } from "@/lib/auth/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
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
