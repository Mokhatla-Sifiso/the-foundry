import { NextResponse } from "next/server";
import { NotifyError } from "@/lib/access/notify";
import { SITE } from "@/lib/constants";
import { headers } from "next/headers";
import { getSessionContext } from "@/lib/auth/admin";
import { createDemoRequest } from "@/lib/access/executive";
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
    const slot = typeof body?.slot === "string" ? body.slot.trim().slice(0, 200) : "";
    const topic = typeof body?.topic === "string" ? body.topic.trim().slice(0, 500) : "";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
    if (!slot) {
      return NextResponse.json({ message: "Tell me a preferred day and time." }, { status: 400 });
    }
    await createDemoRequest({
      email: ctx.email,
      name: ctx.name || "Executive",
      slot,
      topic,
      message,
      ip: clientIp(hdrs),
      ua: hdrs.get("user-agent"),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[executive/demo]", err);
    if (err instanceof NotifyError) {
      return NextResponse.json(
        {
          message: `Your demo request is saved, but the confirmation email failed. Email ${SITE.email} directly and I'll pick it up.`,
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ message: "Could not submit your request." }, { status: 500 });
  }
}
