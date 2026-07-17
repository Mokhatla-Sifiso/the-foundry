import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSessionContext } from "@/lib/auth/admin";
import { createGuestRequest, guestStateForEmail, renotifyPendingRequest } from "@/lib/access/guest";
import { NotifyError } from "@/lib/access/notify";
import { GUEST_RESOURCE_KEYS } from "@/lib/access/resources";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SITE } from "@/lib/constants";
export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Verify your email first." }, { status: 401 });
    }
    if (!(await rateLimit("access-request", `email:${ctx.email}`))) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a few minutes." },
        { status: 429 },
      );
    }
    // Checked before the body: a pending request already carries its resources,
    // so a nudge from the pending card sends no payload and must not be validated
    // as if it were a fresh request.
    const existing = await guestStateForEmail(ctx.email);
    if (existing.status === "pending") {
      // Resubmitting is the only lever a guest has when the first notification
      // never landed, so make it actually re-notify instead of silently no-oping.
      await renotifyPendingRequest(ctx.email);
      return NextResponse.json({ ok: true, status: "pending" });
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
    if (err instanceof NotifyError) {
      return NextResponse.json(
        {
          message: `Your request is saved, but the confirmation email failed. Email ${SITE.email} directly and I'll pick it up.`,
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ message: "Could not submit your request." }, { status: 500 });
  }
}
