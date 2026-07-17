import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendContactToOwner } from "@/lib/access/email";
import { normalizeEmail } from "@/lib/auth/validation";
import { CONTACT_INTENTS } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);

    if (typeof body?.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
    const intent = CONTACT_INTENTS.find(
      (i) => typeof body?.intent === "string" && i.value === body.intent,
    );

    if (!name) {
      return NextResponse.json({ message: "Please add your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email." }, { status: 400 });
    }
    if (!intent) {
      return NextResponse.json({ message: "Pick what this is about." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json(
        { message: "A little more detail helps, 10 characters or more." },
        { status: 400 },
      );
    }

    const hdrs = await headers();
    const allowed = await rateLimit("contact", clientIp(hdrs));
    if (!allowed) {
      return NextResponse.json(
        { message: "That's a few messages in a short window. Try again shortly." },
        { status: 429 },
      );
    }

    await sendContactToOwner({ name, email, intent: intent.label, message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ message: "Could not send your message." }, { status: 500 });
  }
}
