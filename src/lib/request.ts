import { NextResponse } from "next/server";

/**
 * CSRF check for POST routes, matching the rule Next applies to Server Actions: when a browser
 * sends `Origin`, its host must equal the first `X-Forwarded-Host` value or `Host`. A request
 * without `Origin` passes, because browsers always send it on cross-site POSTs and a handcrafted
 * request carries no visitor's credentials. An opaque (`null`) or malformed `Origin` fails.
 */
export function isSameOrigin(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (origin === null) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const forwardedHost = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return originHost !== "" && (originHost === forwardedHost || originHost === headers.get("host"));
}

/** Reads a POST body sent as a form (urlencoded or multipart) or as JSON; anything else is empty. */
export async function readFields(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.startsWith("application/json")) {
      const body: unknown = await request.json();
      return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    }
    if (
      type.startsWith("application/x-www-form-urlencoded") ||
      type.startsWith("multipart/form-data")
    ) {
      return Object.fromEntries(await request.formData());
    }
  } catch {
    // A malformed body reads as empty, so validation rejects it like a missing field.
  }
  return {};
}

/** A 303 to a same-site page, so a form POST lands on a page the visitor can reload. */
export function seeOther(request: Request, path: string, params: Record<string, string>): Response {
  const url = new URL(path, request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}
