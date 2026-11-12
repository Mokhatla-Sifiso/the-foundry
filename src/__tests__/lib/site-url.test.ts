describe("SITE_URL", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_ENV;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("is the custom domain in production, whatever the other variables say", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://the-foundry-seven.vercel.app";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "the-foundry-seven.vercel.app";
    process.env.VERCEL_URL = "the-foundry-abc123.vercel.app";
    const { SITE_URL, PRODUCTION_SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://www.mzwakhemokhatla.co.za");
    expect(PRODUCTION_SITE_URL).toBe(SITE_URL);
  });

  it("prefers NEXT_PUBLIC_SITE_URL outside production and strips a trailing slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://foundry.dev/";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://foundry.dev");
  });

  it("keeps NEXT_PUBLIC_SITE_URL as-is when it has no trailing slash", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://foundry.dev";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://foundry.dev");
  });

  it("uses the preview deployment's own URL in a preview", async () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "the-foundry-seven.vercel.app";
    process.env.VERCEL_URL = "preview-abc123.vercel.app";
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("https://preview-abc123.vercel.app");
  });

  it("defaults to localhost when no environment hints are present", async () => {
    const { SITE_URL } = await import("@/lib/site-url");
    expect(SITE_URL).toBe("http://localhost:3000");
  });
});
