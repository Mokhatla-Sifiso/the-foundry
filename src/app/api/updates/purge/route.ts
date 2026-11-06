import { createHash, timingSafeEqual } from "node:crypto";
import { SERVER_ERROR } from "@/lib/updates/messages";
import { purgeStalePending } from "@/lib/updates/subscribers";

// Runs on every invocation; a cached response would skip the purge.
export const dynamic = "force-dynamic";

/** Compares in constant time, so the secret cannot be guessed from response timings. */
function authorised(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const digest = (value: string): Buffer => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

/**
 * The daily Vercel cron in vercel.json (spec UG FR-UG-10): deletes sign-ups never confirmed
 * within 7 days. Vercel sends `Authorization: Bearer <CRON_SECRET>`; anything else gets 401.
 * Deleting what is stale is safe to repeat, so a duplicate or missed run does no harm.
 */
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
