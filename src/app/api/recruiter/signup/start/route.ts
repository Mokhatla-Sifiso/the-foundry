import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { isWhitelisted } from "@/lib/auth/admin";
import { validateSignup } from "@/lib/auth/validation";
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json().catch(() => null);
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    const adminGate = email ? await isWhitelisted(email) : false;
    const result = validateSignup(payload, { isAdmin: adminGate });
    if (!result.ok) {
      return NextResponse.json(
        { message: result.error.message, field: result.error.field },
        { status: 400 },
      );
    }
    const hdrs = await headers();
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
