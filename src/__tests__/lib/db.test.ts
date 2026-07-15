type GlobalWithPrisma = typeof globalThis & { prisma?: unknown };

function mockPrisma(): void {
  jest.doMock("@prisma/client", () => ({
    PrismaClient: class {
      opts: unknown;
      tag = "prisma-client";
      constructor(opts?: unknown) {
        this.opts = opts;
      }
      $connect(): string {
        return "connected";
      }
    },
  }));
  jest.doMock("@prisma/adapter-neon", () => ({
    PrismaNeon: class {
      config: unknown;
      constructor(config?: unknown) {
        this.config = config;
      }
    },
  }));
}

describe("db (prisma neon proxy)", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete (globalThis as GlobalWithPrisma).prisma;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    delete (globalThis as GlobalWithPrisma).prisma;
  });

  it("throws a descriptive error when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    mockPrisma();
    const { db } = await import("@/lib/db");
    expect(() => {
      // Accessing any property triggers lazy client creation.
      void (db as unknown as { $connect: unknown }).$connect;
    }).toThrow(/DATABASE_URL is not set/);
  });

  it("returns a bound function for method access when DATABASE_URL is set", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@host/db";
    mockPrisma();
    const { db } = await import("@/lib/db");
    const connect = (db as unknown as { $connect: () => string }).$connect;
    expect(typeof connect).toBe("function");
    // A bound function keeps working when detached from the receiver.
    expect(connect()).toBe("connected");
  });

  it("returns non-function property values directly", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@host/db";
    mockPrisma();
    const { db } = await import("@/lib/db");
    expect((db as unknown as { tag: string }).tag).toBe("prisma-client");
  });

  it("caches the created client on globalThis", async () => {
    process.env.DATABASE_URL = "postgres://user:pass@host/db";
    mockPrisma();
    const { db } = await import("@/lib/db");
    void (db as unknown as { tag: string }).tag;
    expect((globalThis as GlobalWithPrisma).prisma).toBeDefined();
    // A second access reuses the cached client rather than creating a new one.
    const first = (globalThis as GlobalWithPrisma).prisma;
    void (db as unknown as { $connect: unknown }).$connect;
    expect((globalThis as GlobalWithPrisma).prisma).toBe(first);
  });
});
