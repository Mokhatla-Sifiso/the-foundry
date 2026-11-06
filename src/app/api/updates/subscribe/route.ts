import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { subscribe } from "@/lib/updates/subscribers";
import { parseSubscribe } from "@/lib/updates/validation";

const LIMITED = "A few attempts in a short window. Try again shortly.";

/**
 * Launch-update sign-up (spec UG 7.1). New, pending and confirmed addresses all get the same
 * 202, and so does a bot that filled the honeypot, so nobody can test who is on the list.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    if (!isSameOrigin(request.headers)) {
      return NextResponse.json({ message: "Requests must come from this site." }, { status: 403 });
    }
    const input = parseSubscribe(await request.json().catch(() => null));
    if (!input.ok) {
      return NextResponse.json({ message: input.message, field: input.field }, { status: 400 });
    }
    if ("bot" in input) return accepted();
    const allowed =
      (await rateLimit("updates-subscribe", `ip:${clientIp(request.headers)}`)) &&
      (await rateLimit("updates-subscribe", `email:${input.email}`));
    if (!allowed) return NextResponse.json({ message: LIMITED }, { status: 429 });
    await subscribe(input.email);
    return accepted();
  } catch (err) {
    console.error("[updates/subscribe]", err);
    return NextResponse.json({ message: "Something went wrong. Try again." }, { status: 500 });
  }
}

function accepted(): Response {
  return NextResponse.json({ ok: true }, { status: 202 });
}
