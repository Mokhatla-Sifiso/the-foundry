const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

type SendPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

type AuthEmailModule = typeof import("@/lib/auth/email");

const ORIGINAL_ENV = process.env;

async function loadModule(): Promise<AuthEmailModule> {
  return import("@/lib/auth/email");
}

function lastPayload(): SendPayload {
  const calls = mockSend.mock.calls;
  return calls[calls.length - 1][0] as SendPayload;
}

let warnSpy: jest.SpyInstance;

beforeEach(() => {
  jest.resetModules();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: "email_123" }, error: null });
  process.env = { ...ORIGINAL_ENV };
  (process.env as Record<string, string>).NODE_ENV = "test";
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM = "Foundry <noreply@mzwakhe.test>";
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
  process.env = ORIGINAL_ENV;
});

describe("sendOtpEmail (happy path)", () => {
  it("sends to the recipient with the access-code subject", async () => {
    const mod = await loadModule();
    await mod.sendOtpEmail("jordan@acme.co", "123456");

    expect(mockSend).toHaveBeenCalledTimes(1);
    const payload = lastPayload();
    expect(payload.to).toBe("jordan@acme.co");
    expect(payload.from).toBe("Foundry <noreply@mzwakhe.test>");
    expect(payload.subject).toBe("Your access code");
  });

  it("embeds the one-time code in both the text and HTML bodies", async () => {
    const mod = await loadModule();
    await mod.sendOtpEmail("jordan@acme.co", "987654");
    const payload = lastPayload();
    expect(payload.text).toContain("987654");
    expect(payload.text).toContain("expires in 5 minutes");
    expect(payload.html).toContain("987654");
  });

  it("uses the default FROM address when RESEND_FROM is unset", async () => {
    delete process.env.RESEND_FROM;
    const mod = await loadModule();
    await mod.sendOtpEmail("jordan@acme.co", "111222");
    expect(lastPayload().from).toBe("Mzwakhe Mokhatla <noreply@example.com>");
  });
});

describe("missing RESEND_API_KEY (dev fallback)", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    (process.env as Record<string, string>).NODE_ENV = "test";
  });

  it("resolves without throwing and logs the OTP instead of sending", async () => {
    const mod = await loadModule();
    await expect(mod.sendOtpEmail("jordan@acme.co", "424242")).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("424242"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY missing"));
  });
});

describe("missing RESEND_API_KEY (production)", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    (process.env as Record<string, string>).NODE_ENV = "production";
  });

  it("throws instead of falling back to the console", async () => {
    const mod = await loadModule();
    await expect(mod.sendOtpEmail("jordan@acme.co", "424242")).rejects.toThrow(
      "RESEND_API_KEY missing",
    );
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("transport error handling", () => {
  it("dev: swallows the Resend error and warns with the OTP", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "rejected" } });
    (process.env as Record<string, string>).NODE_ENV = "test";
    const mod = await loadModule();
    await expect(mod.sendOtpEmail("jordan@acme.co", "555000")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("rejected"));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("555000"));
  });

  it("production: rethrows the Resend error message", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "rejected" } });
    (process.env as Record<string, string>).NODE_ENV = "production";
    const mod = await loadModule();
    await expect(mod.sendOtpEmail("jordan@acme.co", "555000")).rejects.toThrow(
      "rejected",
    );
  });
});

describe("client caching", () => {
  it("instantiates the Resend client only once across sends", async () => {
    const { Resend } = await import("resend");
    const ResendMock = Resend as unknown as jest.Mock;
    ResendMock.mockClear();
    const mod = await loadModule();
    await mod.sendOtpEmail("a@acme.co", "000111");
    await mod.sendOtpEmail("b@acme.co", "222333");
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(ResendMock).toHaveBeenCalledTimes(1);
  });
});
