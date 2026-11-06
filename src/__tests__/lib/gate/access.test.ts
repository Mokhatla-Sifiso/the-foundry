import { hasAccess, isExempt, safeReturnPath } from "@/lib/gate/access";

describe("isExempt (TC-01)", () => {
  it.each([
    "/api/updates/subscribe",
    "/api/site-access",
    "/_next/static/chunk.js",
    "/legal",
    "/legal/privacy",
    "/updates/confirm",
    "/updates/unsubscribe",
    "/robots.txt",
    "/sitemap.xml",
    "/icon.svg",
    "/images/portrait.webp",
  ])("leaves %s reachable", (path) => {
    expect(isExempt(path)).toBe(true);
  });

  it.each(["/", "/recruiter", "/guest", "/executive", "/upgrades", "/legalese", "/updates"])(
    "gates %s",
    (path) => {
      expect(isExempt(path)).toBe(false);
    },
  );
});

describe("hasAccess (TC-01)", () => {
  it("accepts only the current cookie version", () => {
    expect(hasAccess("v1")).toBe(true);
    expect(hasAccess(undefined)).toBe(false);
    expect(hasAccess("")).toBe(false);
    expect(hasAccess("v0")).toBe(false);
  });
});

describe("safeReturnPath (TC-02)", () => {
  it.each([
    ["/", "/"],
    ["/recruiter", "/recruiter"],
    ["/guest?token=x", "/guest?token=x"],
    ["/a/b?c=d&e=f", "/a/b?c=d&e=f"],
  ])("keeps the same-origin path %s", (raw, expected) => {
    expect(safeReturnPath(raw)).toBe(expected);
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "https://evil.com",
    "evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "",
    undefined,
    42,
  ])("sends %p back to the home page", (raw) => {
    expect(safeReturnPath(raw)).toBe("/");
  });

  it("keeps encoded slashes as part of the path, never as a new host", () => {
    expect(safeReturnPath("/%2F%2Fevil.com")).toBe("/%2F%2Fevil.com");
    expect(new URL(safeReturnPath("/%2F%2Fevil.com"), "https://mzwakhe.dev").host).toBe(
      "mzwakhe.dev",
    );
  });
});
