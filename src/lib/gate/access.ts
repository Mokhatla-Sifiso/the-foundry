/**
 * The site gate (spec UG FR-UG-01 to FR-UG-03): until a visitor chooses "Go to previous
 * portfolio version for now", every page shows the upgrades gate in its place.
 */

/** Versioned, so a later change can put everyone back behind the gate (FR-UG-03). */
export const ACCESS_COOKIE = "site-access";
export const ACCESS_VALUE = "v2";
export const ACCESS_PATH = "/api/site-access";

export const GATE_PATH = "/upgrades";
/** Carries the page the visitor asked for from the proxy to the gate, so the button returns there. */
export const RETURN_HEADER = "x-gate-return";

const EXEMPT_PREFIXES = ["/api/", "/_next/", "/legal/"] as const;
const EXEMPT_PATHS = new Set(["/legal", "/updates/confirm", "/updates/unsubscribe"]);

/**
 * Paths that stay reachable without access (FR-UG-01): the API, Next's own assets, the legal
 * pages, the pages sign-up emails link to, and files such as robots.txt, sitemap.xml, the icon
 * and the images link previews use.
 */
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

/**
 * A return path the visitor can be sent back to: a same-origin relative path, with its query
 * string. Anything else, such as `//evil.com`, `/\evil`, an absolute URL or a disguised
 * variant of these, becomes `/`, so the endpoint cannot be used as an open redirect (FR-UG-02).
 */
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
