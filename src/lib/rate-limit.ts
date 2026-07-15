import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Kind = "otp-send" | "otp-verify" | "cv-download" | "access-request";

const POLICY: Record<Kind, { limit: number; window: Duration }> = {
  "otp-send": { limit: 5, window: "10 m" },
  "otp-verify": { limit: 10, window: "10 m" },
  "cv-download": { limit: 30, window: "10 m" },
  "access-request": { limit: 8, window: "10 m" },
};

let redis: Redis | null | undefined;
let warned = false;
const limiters = new Map<Kind, Ratelimit>();

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  if (!redis && process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn(
      "[rate-limit] No Upstash/KV credentials found; auth endpoints are NOT rate limited. " +
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN).",
    );
  }
  return redis;
}

function getLimiter(kind: Kind): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;
  const existing = limiters.get(kind);
  if (existing) return existing;
  const { limit, window } = POLICY[kind];
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `rl:${kind}`,
    analytics: false,
  });
  limiters.set(kind, limiter);
  return limiter;
}

export async function rateLimit(kind: Kind, identifier: string): Promise<boolean> {
  const limiter = getLimiter(kind);
  if (!limiter) return true;
  try {
    const { success } = await limiter.limit(identifier);
    return success;
  } catch (err) {
    console.error("[rate-limit] limiter error, failing open", err);
    return true;
  }
}

export function clientIp(headerList: Headers): string {
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}
