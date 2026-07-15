import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/admin";
import { executiveRequestsForEmail } from "@/lib/access/executive";

export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ verified: false, requests: { demo: false, repo: false } });
    }
    const requests = await executiveRequestsForEmail(ctx.email);
    return NextResponse.json({ verified: true, email: ctx.email, name: ctx.name, requests });
  } catch (err) {
    console.error("[executive/session]", err);
    return NextResponse.json({ message: "Could not load session." }, { status: 500 });
  }
}
