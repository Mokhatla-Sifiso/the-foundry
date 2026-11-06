import { isSameOrigin, readFields, seeOther } from "@/lib/request";

describe("isSameOrigin", () => {
  const check = (init: Record<string, string>): boolean => isSameOrigin(new Headers(init));

  it("accepts an Origin matching Host or the first X-Forwarded-Host", () => {
    expect(check({ origin: "https://mzwakhe.dev", host: "mzwakhe.dev" })).toBe(true);
    expect(
      check({
        origin: "https://mzwakhe.dev",
        host: "internal:3000",
        "x-forwarded-host": "mzwakhe.dev, proxy.local",
      }),
    ).toBe(true);
    expect(check({ origin: "http://localhost:3000", host: "localhost:3000" })).toBe(true);
  });

  it("accepts a request with no Origin, as Next does for Server Actions", () => {
    expect(check({ host: "mzwakhe.dev" })).toBe(true);
  });

  it.each([
    ["another site", "https://evil.example"],
    ["another port", "https://mzwakhe.dev:8443"],
    ["an opaque origin", "null"],
    ["a malformed origin", "not a url"],
    ["an origin with no host", "file:///etc/passwd"],
  ])("rejects %s", (_label, origin) => {
    expect(check({ origin, host: "mzwakhe.dev" })).toBe(false);
  });

  it("does not trust a forwarded host other than the first", () => {
    expect(
      check({
        origin: "https://evil.example",
        host: "mzwakhe.dev",
        "x-forwarded-host": "mzwakhe.dev, evil.example",
      }),
    ).toBe(false);
  });
});

describe("readFields", () => {
  const post = (body?: BodyInit, type?: string): Request =>
    new Request("https://mzwakhe.dev/api/x", {
      method: "POST",
      body,
      headers: type ? { "content-type": type } : {},
    });

  it("reads JSON objects", async () => {
    expect(await readFields(post('{"token":"abc"}', "application/json"))).toEqual({
      token: "abc",
    });
  });

  it("reads urlencoded and multipart forms", async () => {
    expect(
      await readFields(post("List-Unsubscribe=One-Click", "application/x-www-form-urlencoded")),
    ).toEqual({ "List-Unsubscribe": "One-Click" });
    const form = new FormData();
    form.set("token", "abc");
    expect(await readFields(post(form))).toEqual({ token: "abc" });
  });

  it("reads malformed JSON, JSON that is not an object, other types and no body as empty", async () => {
    expect(await readFields(post("{", "application/json"))).toEqual({});
    expect(await readFields(post("42", "application/json"))).toEqual({});
    expect(await readFields(post("token=abc", "text/plain"))).toEqual({});
    expect(await readFields(post())).toEqual({});
  });
});

describe("seeOther", () => {
  it("answers 303 to a path on the requesting host, with encoded parameters", () => {
    const res = seeOther(new Request("https://preview.mzwakhe.dev/api/x?y=1"), "/updates/confirm", {
      status: "a&b",
    });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(
      "https://preview.mzwakhe.dev/updates/confirm?status=a%26b",
    );
  });
});
