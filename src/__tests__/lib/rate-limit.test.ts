type LimitResult = { success: boolean };
type LimitImpl = (id: string) => Promise<LimitResult>;

function mockUpstash(limitImpl: LimitImpl): {
  redisCtor: jest.Mock;
  ratelimitCtor: jest.Mock & { slidingWindow: jest.Mock };
} {
  const redisCtor = jest.fn().mockImplementation(() => ({ __redis: true }));
  const ratelimitCtor = jest
    .fn()
    .mockImplementation(() => ({ limit: limitImpl })) as jest.Mock & {
    slidingWindow: jest.Mock;
  };
  ratelimitCtor.slidingWindow = jest.fn().mockReturnValue("sliding-window");
  jest.doMock("@upstash/redis", () => ({ Redis: redisCtor }));
  jest.doMock("@upstash/ratelimit", () => ({ Ratelimit: ratelimitCtor }));
  return { redisCtor, ratelimitCtor };
}

describe("rate-limit", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe("rateLimit — no credentials (fail-open)", () => {
    it("returns true when no Upstash/KV credentials are configured", async () => {
      const { ratelimitCtor } = mockUpstash(async () => ({ success: false }));
      const { rateLimit } = await import("@/lib/rate-limit");
      await expect(rateLimit("otp-send", "1.2.3.4")).resolves.toBe(true);
      // Limiter should never be constructed when there is no redis client.
      expect(ratelimitCtor).not.toHaveBeenCalled();
    });

    it("warns once in production when credentials are missing", async () => {
      (process.env as Record<string, string>).NODE_ENV = "production";
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      mockUpstash(async () => ({ success: true }));
      const { rateLimit } = await import("@/lib/rate-limit");
      await rateLimit("otp-send", "ip");
      // Second call must not warn again (module-scoped `warned` guard).
      await rateLimit("otp-verify", "ip");
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toContain("[rate-limit]");
    });
  });

  describe("rateLimit — with credentials", () => {
    it("returns success=true from the limiter", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "token-abc";
      const { redisCtor, ratelimitCtor } = mockUpstash(async () => ({
        success: true,
      }));
      const { rateLimit } = await import("@/lib/rate-limit");
      await expect(rateLimit("otp-send", "1.2.3.4")).resolves.toBe(true);
      expect(redisCtor).toHaveBeenCalledWith({
        url: "https://example.upstash.io",
        token: "token-abc",
      });
      expect(ratelimitCtor).toHaveBeenCalledTimes(1);
    });

    it("returns success=false when the limiter blocks the request", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "token-abc";
      mockUpstash(async () => ({ success: false }));
      const { rateLimit } = await import("@/lib/rate-limit");
      await expect(rateLimit("otp-verify", "1.2.3.4")).resolves.toBe(false);
    });

    it("falls back to KV_REST_API_* credentials", async () => {
      process.env.KV_REST_API_URL = "https://kv.example.com";
      process.env.KV_REST_API_TOKEN = "kv-token";
      const { redisCtor } = mockUpstash(async () => ({ success: true }));
      const { rateLimit } = await import("@/lib/rate-limit");
      await expect(rateLimit("cv-download", "1.2.3.4")).resolves.toBe(true);
      expect(redisCtor).toHaveBeenCalledWith({
        url: "https://kv.example.com",
        token: "kv-token",
      });
    });

    it("caches the limiter per kind (constructs it only once)", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "token-abc";
      const { ratelimitCtor } = mockUpstash(async () => ({ success: true }));
      const { rateLimit } = await import("@/lib/rate-limit");
      await rateLimit("access-request", "a");
      await rateLimit("access-request", "b");
      expect(ratelimitCtor).toHaveBeenCalledTimes(1);
    });

    it("fails open (returns true) when the limiter throws", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "token-abc";
      const error = jest.spyOn(console, "error").mockImplementation(() => {});
      mockUpstash(async () => {
        throw new Error("redis down");
      });
      const { rateLimit } = await import("@/lib/rate-limit");
      await expect(rateLimit("otp-send", "1.2.3.4")).resolves.toBe(true);
      expect(error).toHaveBeenCalled();
    });
  });

  describe("clientIp", () => {
    it("uses the first entry of a multi-value x-forwarded-for header", async () => {
      mockUpstash(async () => ({ success: true }));
      const { clientIp } = await import("@/lib/rate-limit");
      const headers = new Headers({
        "x-forwarded-for": "1.1.1.1, 2.2.2.2, 3.3.3.3",
      });
      expect(clientIp(headers)).toBe("1.1.1.1");
    });

    it("trims whitespace around the forwarded IP", async () => {
      mockUpstash(async () => ({ success: true }));
      const { clientIp } = await import("@/lib/rate-limit");
      const headers = new Headers({ "x-forwarded-for": "   4.4.4.4   " });
      expect(clientIp(headers)).toBe("4.4.4.4");
    });

    it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
      mockUpstash(async () => ({ success: true }));
      const { clientIp } = await import("@/lib/rate-limit");
      const headers = new Headers({ "x-real-ip": "9.9.9.9" });
      expect(clientIp(headers)).toBe("9.9.9.9");
    });

    it("returns 'unknown' when no IP headers are present", async () => {
      mockUpstash(async () => ({ success: true }));
      const { clientIp } = await import("@/lib/rate-limit");
      expect(clientIp(new Headers())).toBe("unknown");
    });
  });
});
