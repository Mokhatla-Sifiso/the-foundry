/**
 * @jest-environment node
 */
import { POST } from "@/app/api/site-access/route";

function post(fields: Record<string, string>, origin = "https://mzwakhe.dev"): Request {
  return new Request("https://mzwakhe.dev/api/site-access", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      host: "mzwakhe.dev",
      origin,
    },
    body: new URLSearchParams(fields).toString(),
  });
}

describe("POST /api/site-access", () => {
  it("remembers the choice for 30 days and returns to the page asked for, query intact", async () => {
    const res = await POST(post({ return: "/guest?token=x" }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://mzwakhe.dev/guest?token=x");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^site-access=v1;/);
    expect(cookie).toContain("Max-Age=2592000");
    expect(cookie).toContain("Path=/");
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=lax/i);
  });

  it.each(["//evil.com", "https://evil.com", "/\\evil.com"])(
    "will not redirect off the site to %s",
    async (target) => {
      const res = await POST(post({ return: target }));
      expect(res.headers.get("location")).toBe("https://mzwakhe.dev/");
    },
  );

  it("returns to the home page when no path is given", async () => {
    const res = await POST(post({}));
    expect(res.headers.get("location")).toBe("https://mzwakhe.dev/");
  });

  it("rejects a form posted from another site, setting nothing", async () => {
    const res = await POST(post({ return: "/" }, "https://evil.example"));
    expect(res.status).toBe(403);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
