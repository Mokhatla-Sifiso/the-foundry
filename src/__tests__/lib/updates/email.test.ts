export {};

const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));

jest.mock("@/lib/site-url", () => ({ SITE_URL: "https://mzwakhe.test" }));

type EmailModule = typeof import("@/lib/updates/email");

const ORIGINAL_ENV = process.env;
let warnSpy: jest.SpyInstance;

async function load(): Promise<EmailModule> {
  return import("@/lib/updates/email");
}

beforeEach(() => {
  jest.resetModules();
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: "email_1" }, error: null });
  process.env = {
    ...ORIGINAL_ENV,
    RESEND_API_KEY: "re_test",
    RESEND_FROM: "Foundry <noreply@mzwakhe.test>",
  };
  (process.env as Record<string, string>).NODE_ENV = "test";
  warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => warnSpy.mockRestore());
afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("linksFor", () => {
  it("builds the confirm page, unsubscribe page and one-click endpoint from the raw tokens", async () => {
    const { linksFor } = await load();
    expect(linksFor("CONF", "UNSUB")).toEqual({
      confirmUrl: "https://mzwakhe.test/updates/confirm?token=CONF",
      unsubscribeUrl: "https://mzwakhe.test/updates/unsubscribe?token=UNSUB",
      oneClickUrl: "https://mzwakhe.test/api/updates/unsubscribe?token=UNSUB",
    });
  });
});

describe("renderConfirmation", () => {
  it("puts the confirm button, unsubscribe and privacy links in both the HTML and text parts", async () => {
    const { linksFor, renderConfirmation } = await load();
    const { subject, html, text } = renderConfirmation(linksFor("CONF", "UNSUB"));
    expect(subject).toBe("Confirm your email");
    for (const part of [html, text]) {
      expect(part).toContain("https://mzwakhe.test/updates/confirm?token=CONF");
      expect(part).toContain("https://mzwakhe.test/updates/unsubscribe?token=UNSUB");
      expect(part).toContain("https://mzwakhe.test/legal/privacy");
      expect(part).toContain("expires in 48 hours");
    }
    expect(html).toContain("prefers-color-scheme: dark");
    expect(html).not.toContain(String.fromCharCode(0x2014));
  });
});

describe("sendConfirmation", () => {
  it("sends with RFC 8058 one-click unsubscribe headers", async () => {
    const { linksFor, sendConfirmation } = await load();
    await sendConfirmation("name@company.com", linksFor("CONF", "UNSUB"));
    expect(mockSend).toHaveBeenCalledTimes(1);
    const payload = mockSend.mock.calls[0][0];
    expect(payload).toMatchObject({
      from: "Foundry <noreply@mzwakhe.test>",
      to: "name@company.com",
      subject: "Confirm your email",
      headers: {
        "List-Unsubscribe": "<https://mzwakhe.test/api/updates/unsubscribe?token=UNSUB>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
  });

  it("creates one Resend client and reuses it for later sends", async () => {
    const { linksFor, sendConfirmation } = await load();
    const { Resend } = await import("resend");
    await sendConfirmation("a@b.co", linksFor("C", "U"));
    await sendConfirmation("c@d.co", linksFor("C", "U"));
    expect(Resend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("throws when Resend reports an error, so the caller can answer with a retryable failure", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "domain not verified" } });
    const { linksFor, sendConfirmation } = await load();
    await expect(sendConfirmation("a@b.co", linksFor("C", "U"))).rejects.toThrow(
      "domain not verified",
    );
  });

  it("logs instead of sending in development when no key is set", async () => {
    delete process.env.RESEND_API_KEY;
    const { linksFor, sendConfirmation } = await load();
    await sendConfirmation("a@b.co", linksFor("C", "U"));
    expect(mockSend).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY missing"));
  });

  it("refuses to pretend in production when no key is set", async () => {
    delete process.env.RESEND_API_KEY;
    (process.env as Record<string, string>).NODE_ENV = "production";
    const { linksFor, sendConfirmation } = await load();
    await expect(sendConfirmation("a@b.co", linksFor("C", "U"))).rejects.toThrow(
      "RESEND_API_KEY missing",
    );
  });
});
