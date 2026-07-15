describe("SITE_URL", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("prefers NEXT_PUBLIC_SITE_URL and strips a trailing slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://foundry.dev/";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://foundry.dev");
  });

  it("keeps NEXT_PUBLIC_SITE_URL as-is when it has no trailing slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://foundry.dev";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://foundry.dev");
  });

  it("uses VERCEL_PROJECT_PRODUCTION_URL with an https prefix", async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "foundry.vercel.app";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://foundry.vercel.app");
  });

  it("prefers the production URL over the ephemeral VERCEL_URL", async () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "prod.vercel.app";
    process.env.VERCEL_URL = "preview-abc123.vercel.app";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://prod.vercel.app");
  });

  it("falls back to VERCEL_URL when no production URL is set", async () => {
    process.env.VERCEL_URL = "preview-abc123.vercel.app";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://preview-abc123.vercel.app");
  });

  it("defaults to localhost when no environment hints are present", async () => {
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("http://localhost:3000");
  });
});
