import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/admin";
import { logConsent, type ConsentActionKind } from "@/lib/privacy/log";
const VALID_ACTIONS: readonly ConsentActionKind[] = [
  "grant",
  "withdraw",
  "update",
  "accept_terms",
  "accept_privacy",
];
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);
    const action = typeof body?.action === "string" ? body.action : "";
    if (!VALID_ACTIONS.includes(action as ConsentActionKind)) {
      return NextResponse.json({ message: "Invalid consent action." }, { status: 400 });
    }
    if (!body?.choices || typeof body.choices !== "object") {
      return NextResponse.json({ message: "choices payload missing." }, { status: 400 });
    }
    const ctx = await getSessionContext();
    await logConsent({
      userId: ctx?.userId,
      action: action as ConsentActionKind,
      payload: body.choices as Record<string, unknown>,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[privacy/consent]", err);
    return NextResponse.json({ message: "Could not record consent." }, { status: 500 });
  }
}
