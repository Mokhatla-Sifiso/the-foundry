import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSessionContext } from "@/lib/auth/admin";
import { createGuestRequest, guestStateForEmail } from "@/lib/access/guest";
import { GUEST_RESOURCE_KEYS } from "@/lib/access/resources";
import { clientIp } from "@/lib/rate-limit";
export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Verify your email first." }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    const resources = Array.isArray(body?.resources)
      ? body.resources.filter(
          (r: unknown): r is string => typeof r === "string" && GUEST_RESOURCE_KEYS.includes(r),
        )
      : [];
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1000) : "";
    if (resources.length === 0 && !message) {
      return NextResponse.json(
        { message: "Pick at least one resource, or tell me what you need." },
        { status: 400 },
      );
    }
    const existing = await guestStateForEmail(ctx.email);
    if (existing.status === "pending") {
      return NextResponse.json({ ok: true, status: "pending" });
    }
    const hdrs = await headers();
    await createGuestRequest({
      email: ctx.email,
      name: ctx.name || "Guest",
      resources,
      message,
      ip: clientIp(hdrs),
      ua: hdrs.get("user-agent"),
    });
    return NextResponse.json({ ok: true, status: "pending" });
  } catch (err) {
    console.error("[guest/request]", err);
    return NextResponse.json({ message: "Could not submit your request." }, { status: 500 });
  }
}
