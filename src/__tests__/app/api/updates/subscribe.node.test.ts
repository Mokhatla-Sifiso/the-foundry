import { POST } from "@/app/api/updates/subscribe/route";
import { rateLimit } from "@/lib/rate-limit";
import { subscribe } from "@/lib/updates/subscribers";

jest.mock("@/lib/rate-limit", () => ({
  ...jest.requireActual("@/lib/rate-limit"),
  rateLimit: jest.fn(),
}));
jest.mock("@/lib/updates/subscribers", () => ({ subscribe: jest.fn() }));

const limit = rateLimit as jest.Mock;
const service = subscribe as jest.Mock;

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://mzwakhe.dev/api/updates/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "mzwakhe.dev",
      origin: "https://mzwakhe.dev",
      "x-forwarded-for": "1.2.3.4",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

const VALID = { email: " Name@Company.com ", consent: true };

beforeEach(() => {
  jest.clearAllMocks();
  limit.mockResolvedValue(true);
  service.mockResolvedValue(undefined);
});

describe("POST /api/updates/subscribe", () => {
  it("accepts a valid sign-up with 202, limiting by IP and by the normalised address", async () => {
    const res = await POST(post(VALID));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ ok: true });
    expect(limit.mock.calls).toEqual([
      ["updates-subscribe", "ip:1.2.3.4"],
      ["updates-subscribe", "email:name@company.com"],
    ]);
    expect(service).toHaveBeenCalledWith("name@company.com");
  });

  it("answers a repeat sign-up exactly like the first", async () => {
    const first = await POST(post(VALID));
    const second = await POST(post(VALID));
    expect([first.status, second.status]).toEqual([202, 202]);
    expect(await second.json()).toEqual(await first.json());
  });

  it("answers a filled honeypot with 202 and stores nothing", async () => {
    const res = await POST(post({ ...VALID, website: "https://spam.example" }));
    expect(res.status).toBe(202);
    expect(service).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  });

  it.each([
    ["consent", { email: "a@b.co" }, "Tick the box so I can send you the launch email."],
    ["email", { email: "nope", consent: true }, "Enter an email address like name@company.com."],
    ["email", null, "Enter an email address like name@company.com."],
  ])("rejects a missing or invalid %s with 400 naming the field", async (field, body, message) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message, field });
    expect(service).not.toHaveBeenCalled();
  });

  it("rejects a request from another origin with 403 before reading anything", async () => {
    const res = await POST(post(VALID, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(limit).not.toHaveBeenCalled();
    expect(service).not.toHaveBeenCalled();
  });

  it.each([
    ["the IP", [false]],
    ["the address", [true, false]],
  ])("answers 429 when %s is over its limit", async (_label, results) => {
    for (const result of results) limit.mockResolvedValueOnce(result);
    const res = await POST(post(VALID));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({
      message: "A few attempts in a short window. Try again shortly.",
    });
    expect(service).not.toHaveBeenCalled();
  });

  it("answers 500 with a generic message when the email cannot be sent, logging the cause", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    service.mockRejectedValue(new Error("domain not verified"));
    const res = await POST(post(VALID));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: "Something went wrong. Try again." });
    expect(error).toHaveBeenCalledWith("[updates/subscribe]", expect.any(Error));
    error.mockRestore();
  });
});
