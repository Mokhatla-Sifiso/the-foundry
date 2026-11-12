export const ACCESS_COOKIE = "site-access";
export const ACCESS_VALUE = "v2";
export const ACCESS_PATH = "/api/site-access";

export const GATE_PATH = "/upgrades";
export const RETURN_HEADER = "x-gate-return";

const EXEMPT_PREFIXES = ["/api/", "/_next/", "/legal/"] as const;
const EXEMPT_PATHS = new Set(["/legal", "/updates/confirm", "/updates/unsubscribe"]);

export function isExempt(pathname: string): boolean {
  if (EXEMPT_PATHS.has(pathname)) return true;
  if (EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  const last = pathname.slice(pathname.lastIndexOf("/") + 1);
  return /\.[A-Za-z0-9]+$/.test(last);
}

export function hasAccess(cookie: string | undefined): boolean {
  return cookie === ACCESS_VALUE;
}

const BASE = "https://gate.invalid";

export function safeReturnPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return "/";
  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return "/";
  }
  if (url.origin !== BASE) return "/";
  return `${url.pathname}${url.search}`;
}
