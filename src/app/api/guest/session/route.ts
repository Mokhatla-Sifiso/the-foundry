import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/admin";
import { guestStateForEmail } from "@/lib/access/guest";
export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({
        verified: false,
        state: { status: "none", expiresAt: null, resources: [] },
      });
    }
    const state = await guestStateForEmail(ctx.email);
    return NextResponse.json({ verified: true, email: ctx.email, name: ctx.name, state });
  } catch (err) {
    console.error("[guest/session]", err);
    return NextResponse.json({ message: "Could not load session." }, { status: 500 });
  }
}
