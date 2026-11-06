import { createHash, timingSafeEqual } from "node:crypto";
import { SERVER_ERROR } from "@/lib/updates/messages";
import { purgeStalePending } from "@/lib/updates/subscribers";

export const dynamic = "force-dynamic";

function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const digest = (value: string): Buffer => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

export async function GET(request: Request): Promise<Response> {
  if (!authorised(request.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    return Response.json({ purged: await purgeStalePending() });
  } catch (err) {
    console.error("[updates/purge]", err);
    return Response.json({ message: SERVER_ERROR }, { status: 500 });
  }
}
