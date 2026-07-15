import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSessionContext } from "@/lib/auth/admin";
import { createRepoRequest } from "@/lib/access/executive";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Verify your email first." }, { status: 401 });
    }
    const hdrs = await headers();
    if (!(await rateLimit("access-request", `ip:${clientIp(hdrs)}`))) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a few minutes." },
        { status: 429 },
      );
    }
    const body = await request.json().catch(() => null);
    const repos = typeof body?.repos === "string" ? body.repos.trim().slice(0, 300) : "";
    const purpose = typeof body?.purpose === "string" ? body.purpose.trim().slice(0, 500) : "";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
    if (!repos) {
      return NextResponse.json(
        { message: "Tell me which repositories or projects you need." },
        { status: 400 },
      );
    }
    await createRepoRequest({
      email: ctx.email,
      name: ctx.name || "Executive",
      repos,
      purpose,
      message,
      ip: clientIp(hdrs),
      ua: hdrs.get("user-agent"),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[executive/repo]", err);
    return NextResponse.json({ message: "Could not submit your request." }, { status: 500 });
  }
}
