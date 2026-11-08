import { POST } from "@/app/api/updates/confirm/route";
import { rateLimit } from "@/lib/rate-limit";
import { confirm } from "@/lib/updates/subscribers";

jest.mock("@/lib/rate-limit", () => ({
  ...jest.requireActual("@/lib/rate-limit"),
  rateLimit: jest.fn(),
}));
jest.mock("@/lib/updates/subscribers", () => ({ confirm: jest.fn() }));

const limit = rateLimit as jest.Mock;
const service = confirm as jest.Mock;
const TOKEN = "A".repeat(43);

function post(token: string, headers: Record<string, string> = {}): Request {
  return new Request("https://mzwakhe.dev/api/updates/confirm", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      host: "mzwakhe.dev",
      origin: "https://mzwakhe.dev",
      "x-forwarded-for": "1.2.3.4",
      ...headers,
    },
    body: new URLSearchParams({ token }).toString(),
  });
}

async function landing(res: Response): Promise<string | null> {
  expect(res.status).toBe(303);
  return res.headers.get("location");
}

beforeEach(() => {
  jest.clearAllMocks();
  limit.mockResolvedValue(true);
});

describe("POST /api/updates/confirm", () => {
  it.each(["confirmed", "expired", "invalid"])(
    "sends the visitor back to the page with the %s outcome",
    async (outcome) => {
      service.mockResolvedValue(outcome);
      expect(await landing(await POST(post(TOKEN)))).toBe(
        `https://mzwakhe.dev/updates/confirm?status=${outcome}`,
      );
      expect(service).toHaveBeenCalledWith(TOKEN);
      expect(limit).toHaveBeenCalledWith("updates-confirm", "ip:1.2.3.4");
    },
  );

  it("accepts the token as JSON too", async () => {
    service.mockResolvedValue("confirmed");
    const res = await POST(
      new Request("https://mzwakhe.dev/api/updates/confirm", {
        method: "POST",
        headers: { "content-type": "application/json", host: "mzwakhe.dev" },
        body: JSON.stringify({ token: TOKEN }),
      }),
    );
    expect(await landing(res)).toBe("https://mzwakhe.dev/updates/confirm?status=confirmed");
  });

  it("treats a malformed token as invalid without a database lookup", async () => {
    expect(await landing(await POST(post("short")))).toBe(
      "https://mzwakhe.dev/updates/confirm?status=invalid",
    );
    expect(service).not.toHaveBeenCalled();
  });

  it("sends a rate-limited visitor back with the limited status", async () => {
    limit.mockResolvedValue(false);
    expect(await landing(await POST(post(TOKEN)))).toBe(
      `https://mzwakhe.dev/updates/confirm?status=limited&token=${TOKEN}`,
    );
    expect(service).not.toHaveBeenCalled();
  });

  it("rejects a form posted from another origin with 403", async () => {
    const res = await POST(post(TOKEN, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(service).not.toHaveBeenCalled();
  });

  it("sends the visitor back with the error status when the database fails", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    service.mockRejectedValue(new Error("db down"));
    expect(await landing(await POST(post(TOKEN)))).toBe(
      `https://mzwakhe.dev/updates/confirm?status=error&token=${TOKEN}`,
    );
    expect(error).toHaveBeenCalledWith("[updates/confirm]", expect.any(Error));
    error.mockRestore();
  });
});
