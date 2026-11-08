import { GET } from "@/app/api/updates/purge/route";
import { purgeStalePending } from "@/lib/updates/subscribers";

jest.mock("@/lib/updates/subscribers", () => ({ purgeStalePending: jest.fn() }));

const purge = purgeStalePending as jest.Mock;
const ORIGINAL_SECRET = process.env.CRON_SECRET;

function call(authorization?: string): Promise<Response> {
  return GET(
    new Request("https://mzwakhe.dev/api/updates/purge", {
      headers: authorization ? { authorization } : {},
    }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = "s3cretValue123456";
  purge.mockResolvedValue(3);
});

afterAll(() => {
  process.env.CRON_SECRET = ORIGINAL_SECRET;
});

describe("GET /api/updates/purge", () => {
  it("purges stale sign-ups when Vercel's cron calls with the secret", async () => {
    const res = await call("Bearer s3cretValue123456");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ purged: 3 });
    expect(purge).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["no header", undefined],
    ["the wrong secret", "Bearer nope"],
    ["the secret without Bearer", "s3cretValue123456"],
  ])("refuses %s", async (_label, header) => {
    expect((await call(header)).status).toBe(401);
    expect(purge).not.toHaveBeenCalled();
  });

  it("refuses everything when no secret is configured", async () => {
    delete process.env.CRON_SECRET;
    expect((await call("Bearer ")).status).toBe(401);
    expect((await call("Bearer undefined")).status).toBe(401);
    expect(purge).not.toHaveBeenCalled();
  });

  it("answers 500 when the database fails, logging the cause", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    purge.mockRejectedValue(new Error("db down"));
    const res = await call("Bearer s3cretValue123456");
    expect(res.status).toBe(500);
    expect(error).toHaveBeenCalledWith("[updates/purge]", expect.any(Error));
    error.mockRestore();
  });
});
