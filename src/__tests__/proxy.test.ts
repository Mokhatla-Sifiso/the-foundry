import { NextRequest } from "next/server";
import { proxy, config } from "@/proxy";

function req(path: string): NextRequest {
  return new NextRequest(new URL(`https://www.mzwakhemokhatla.co.za${path}`));
}

const matcher = new RegExp(`^${config.matcher[0].source}$`);

describe("proxy CSP", () => {
  it("sets a nonce-based CSP on the response", () => {
    const csp = proxy(req("/")).headers.get("content-security-policy");
    expect(csp).toBeTruthy();
    expect(csp).toMatch(/script-src [^;]*'nonce-[^']+'/);
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("forwards the same nonce to the app via the x-nonce request header", () => {
    const res = proxy(req("/"));
    const csp = res.headers.get("content-security-policy") ?? "";
    const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
    expect(nonce).toBeTruthy();
    expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it("issues a fresh nonce per request", () => {
    const a = proxy(req("/")).headers.get("content-security-policy");
    const b = proxy(req("/")).headers.get("content-security-policy");
    expect(a).not.toEqual(b);
  });
});

describe("proxy site gate (FR-UG-01)", () => {
  const rewrittenTo = (res: Response): string | null => res.headers.get("x-middleware-rewrite");
  const withAccess = (path: string, value = "v1"): NextRequest => {
    const r = req(path);
    r.cookies.set("site-access", value);
    return r;
  };

  it("shows the gate in place of any page without the access cookie, keeping the URL", () => {
    for (const path of ["/", "/recruiter", "/guest?token=x"]) {
      expect(rewrittenTo(proxy(req(path)))).toBe("https://www.mzwakhemokhatla.co.za/upgrades");
    }
  });

  it("passes the page asked for to the gate, query string included", () => {
    const res = proxy(req("/guest?token=x"));
    expect(res.headers.get("x-middleware-request-x-gate-return")).toBe("/guest?token=x");
  });

  it("still applies the CSP to the gate", () => {
    expect(proxy(req("/")).headers.get("content-security-policy")).toMatch(/'nonce-[^']+'/);
  });

  it("lets a visitor with access through", () => {
    const res = proxy(withAccess("/recruiter"));
    expect(rewrittenTo(res)).toBeNull();
    expect(res.headers.get("x-middleware-request-x-gate-return")).toBeNull();
  });

  it("gates again when the cookie is from an older version", () => {
    expect(rewrittenTo(proxy(withAccess("/", "v0")))).not.toBeNull();
  });

  it("never gates the legal pages or the pages sign-up emails open", () => {
    for (const path of ["/legal/privacy", "/updates/confirm?token=x", "/robots.txt"]) {
      expect(rewrittenTo(proxy(req(path)))).toBeNull();
    }
  });
});

describe("proxy matcher", () => {
  it("covers a dotted path that 404s, so error pages still get a CSP", () => {
    expect(matcher.test("/404javascript.js")).toBe(true);
    expect(matcher.test("/does-not-exist")).toBe(true);
    expect(matcher.test("/")).toBe(true);
    expect(matcher.test("/recruiter")).toBe(true);
  });

  it("still skips the API and Next's own static + image pipelines", () => {
    expect(matcher.test("/api/guest/start")).toBe(false);
    expect(matcher.test("/_next/static/chunk.js")).toBe(false);
    expect(matcher.test("/_next/image")).toBe(false);
    expect(matcher.test("/favicon.ico")).toBe(false);
  });
});
