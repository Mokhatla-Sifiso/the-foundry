import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";

export async function POST(): Promise<Response> {
  try {
    const hdrs = await headers();
    await auth.api.signOut({ headers: hdrs });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[recruiter/signout]", err);
    return NextResponse.json({ message: "Could not sign out." }, { status: 500 });
  }
}
