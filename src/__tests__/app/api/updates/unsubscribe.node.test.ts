import { GET, POST } from "@/app/api/updates/unsubscribe/route";
import { unsubscribe } from "@/lib/updates/subscribers";

jest.mock("@/lib/updates/subscribers", () => ({ unsubscribe: jest.fn() }));

const service = unsubscribe as jest.Mock;
const TOKEN = "B".repeat(43);
const ENDPOINT = "https://mzwakhe.dev/api/updates/unsubscribe";

function formPost(token: string, origin = "https://mzwakhe.dev"): Request {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      host: "mzwakhe.dev",
      origin,
    },
    body: new URLSearchParams({ token }).toString(),
  });
}

function oneClick(token: string, body: BodyInit = "List-Unsubscribe=One-Click"): Request {
  const headers: Record<string, string> = { host: "mzwakhe.dev" };
  if (typeof body === "string") headers["content-type"] = "application/x-www-form-urlencoded";
  return new Request(`${ENDPOINT}?token=${token}`, { method: "POST", headers, body });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/updates/unsubscribe from the page", () => {
  it.each(["removed", "invalid"])("sends the visitor back with the %s outcome", async (outcome) => {
    service.mockResolvedValue(outcome);
    const res = await POST(formPost(TOKEN));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(
      `https://mzwakhe.dev/updates/unsubscribe?status=${outcome}`,
    );
    expect(service).toHaveBeenCalledWith(TOKEN);
  });

  it("treats a malformed token as invalid without a database call", async () => {
    const res = await POST(formPost("short"));
    expect(res.headers.get("location")).toBe(
      "https://mzwakhe.dev/updates/unsubscribe?status=invalid",
    );
    expect(service).not.toHaveBeenCalled();
  });

  it("rejects a form posted from another origin with 403", async () => {
    const res = await POST(formPost(TOKEN, "https://evil.example"));
    expect(res.status).toBe(403);
    expect(service).not.toHaveBeenCalled();
  });

  it("sends the visitor back with the error status when the database fails", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    service.mockRejectedValue(new Error("db down"));
    const res = await POST(formPost(TOKEN));
    expect(res.headers.get("location")).toBe(
      `https://mzwakhe.dev/updates/unsubscribe?status=error&token=${TOKEN}`,
    );
    error.mockRestore();
  });
});

describe("POST /api/updates/unsubscribe as RFC 8058 one-click", () => {
  it("deletes the row and answers a bare 200, never a redirect", async () => {
    service.mockResolvedValue("removed");
    const res = await POST(oneClick(TOKEN));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(service).toHaveBeenCalledWith(TOKEN);
  });

  it("accepts the multipart encoding RFC 8058 prefers", async () => {
    service.mockResolvedValue("removed");
    const form = new FormData();
    form.set("List-Unsubscribe", "One-Click");
    expect((await POST(oneClick(TOKEN, form))).status).toBe(200);
    expect(service).toHaveBeenCalledWith(TOKEN);
  });

  it("is not subject to the Origin check, since providers post from their own servers", async () => {
    service.mockResolvedValue("removed");
    const req = oneClick(TOKEN);
    req.headers.set("origin", "https://mail.provider.example");
    expect((await POST(req)).status).toBe(200);
  });

  it("answers 200 for an unknown or malformed token, so a repeat click is harmless", async () => {
    service.mockResolvedValue("invalid");
    expect((await POST(oneClick(TOKEN))).status).toBe(200);
    expect((await POST(oneClick("short"))).status).toBe(200);
    expect(service).toHaveBeenCalledTimes(1);
  });

  it("answers 500 when the database fails, so the provider can retry", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    service.mockRejectedValue(new Error("db down"));
    expect((await POST(oneClick(TOKEN))).status).toBe(500);
    error.mockRestore();
  });
});

describe("GET /api/updates/unsubscribe", () => {
  it("leads a mail client's browser to the page with the token, deleting nothing", () => {
    const res = GET(new Request(`${ENDPOINT}?token=${TOKEN}`));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(
      `https://mzwakhe.dev/updates/unsubscribe?token=${TOKEN}`,
    );
    expect(service).not.toHaveBeenCalled();
  });

  it("drops a malformed token and shows the invalid state", () => {
    const res = GET(new Request(`${ENDPOINT}?token=%3Cscript%3E`));
    expect(res.headers.get("location")).toBe(
      "https://mzwakhe.dev/updates/unsubscribe?status=invalid",
    );
  });
});
