import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/admin";
import { fetchAccount } from "@/lib/auth/profile";
export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return NextResponse.json({ account: null });
    const account = await fetchAccount(ctx.userId);
    return NextResponse.json({ account });
  } catch (err) {
    console.error("[recruiter/session]", err);
    return NextResponse.json({ message: "Could not load session." }, { status: 500 });
  }
}
