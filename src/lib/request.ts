import { NextResponse } from "next/server";

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

export function seeOther(request: Request, path: string, params: Record<string, string>): Response {
  const url = new URL(path, request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, 303);
}
