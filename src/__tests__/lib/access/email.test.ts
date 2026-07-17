import { SITE } from "@/lib/constants";

const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

jest.mock("@/lib/site-url", () => ({
  SITE_URL: "https://mzwakhe.test",
}));

type SendPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
};

type AccessEmailModule = typeof import("@/lib/access/email");

const ORIGINAL_ENV = process.env;

async function loadModule(): Promise<AccessEmailModule> {
  return import("@/lib/access/email");
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

describe("sendGuestRequestToOwner", () => {
  it("emails the site owner with a subject naming the requester", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan Pillay",
      email: "jordan@acme.co",
      resources: ["cv", "repos"],
      message: "Keen to review your work.",
      token: "tok-abc",
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const payload = lastPayload();
    expect(payload.to).toBe(SITE.email);
    expect(payload.from).toBe("Foundry <noreply@mzwakhe.test>");
    expect(payload.subject).toBe("Guest access request from Jordan Pillay");
  });

  it("resolves the resource keys to their human labels", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan",
      email: "jordan@acme.co",
      resources: ["cv", "repos"],
      message: "",
      token: "tok",
    });
    const payload = lastPayload();
    expect(payload.text).toContain("CV (PDF), Private repositories");
    expect(payload.html).toContain("CV (PDF), Private repositories");
  });

  it("falls back to 'not specified' when no resources are requested", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan",
      email: "jordan@acme.co",
      resources: [],
      message: "",
      token: "tok",
    });
    expect(lastPayload().text).toContain("Resources: not specified");
  });

  it("embeds the review link with the token", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan",
      email: "jordan@acme.co",
      resources: ["cv"],
      message: "hello",
      token: "secret-token",
    });
    const payload = lastPayload();
    const link = "https://mzwakhe.test/api/guest/review?token=secret-token";
    expect(payload.text).toContain(link);
    expect(payload.html).toContain(link);
  });

  it("omits the message block when the message is empty", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan",
      email: "jordan@acme.co",
      resources: ["cv"],
      message: "",
      token: "tok",
    });
    const payload = lastPayload();
    expect(payload.text).not.toContain("Message:");
    expect(payload.html).not.toContain("background:#f4f4f5");
  });

  it("HTML-escapes attacker-controlled email and message", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan",
      email: "a&b@acme.co",
      resources: ["cv"],
      message: '<script>alert("xss")</script>',
      token: "tok",
    });
    const { html } = lastPayload();
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;");
    expect(html).toContain("&amp;");
  });

  it("escapes the name inside the bold header of the notification", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "<b>hi</b>",
      email: "jordan@acme.co",
      resources: ["cv"],
      message: "",
      token: "tok",
    });
    expect(lastPayload().html).toContain("&lt;b&gt;hi&lt;/b&gt;");
  });

  it("uses the default FROM address when RESEND_FROM is unset", async () => {
    delete process.env.RESEND_FROM;
    const mod = await loadModule();
    await mod.sendGuestReceipt("jordan@acme.co", "Jordan");
    expect(lastPayload().from).toBe("Mzwakhe Mokhatla <noreply@example.com>");
  });
});

describe("sendGuestReceipt", () => {
  it("emails the requester with the receipt subject", async () => {
    const mod = await loadModule();
    await mod.sendGuestReceipt("jordan@acme.co", "Jordan");
    const payload = lastPayload();
    expect(payload.to).toBe("jordan@acme.co");
    expect(payload.subject).toBe("Your access request is in");
    expect(payload.html).toContain("Hi Jordan");
  });

  it("escapes the recipient name in the HTML body", async () => {
    const mod = await loadModule();
    await mod.sendGuestReceipt("jordan@acme.co", "<b>Jordan</b>");
    expect(lastPayload().html).not.toContain("<b>Jordan</b>");
    expect(lastPayload().html).toContain("&lt;b&gt;Jordan&lt;/b&gt;");
  });
});

describe("sendGuestDecision", () => {
  it("approved: uses the approval subject and includes the expiry date", async () => {
    const mod = await loadModule();
    const expires = new Date("2026-08-14T09:00:00.000Z");
    await mod.sendGuestDecision("jordan@acme.co", "Jordan", true, expires);
    const payload = lastPayload();
    expect(payload.to).toBe("jordan@acme.co");
    expect(payload.subject).toBe("Access approved");
    expect(payload.text).toContain("2026-08-14");
    expect(payload.html).toContain("2026-08-14");
    expect(payload.html).toContain("https://mzwakhe.test/guest");
  });

  it("approved: omits the 'until' clause when no expiry is supplied", async () => {
    const mod = await loadModule();
    await mod.sendGuestDecision("jordan@acme.co", "Jordan", true);
    const payload = lastPayload();
    expect(payload.subject).toBe("Access approved");
    expect(payload.text).not.toContain("(until");
  });

  it("rejected: uses the decline subject and links the owner mailbox", async () => {
    const mod = await loadModule();
    await mod.sendGuestDecision("jordan@acme.co", "Jordan", false);
    const payload = lastPayload();
    expect(payload.subject).toBe("About your access request");
    expect(payload.text).toContain(SITE.email);
    expect(payload.html).toContain(`mailto:${SITE.email}`);
  });
});

describe("sendExecutiveDemoToOwner", () => {
  it("emails the owner with the demo subject and preferred slot", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveDemoToOwner({
      name: "Sam Exec",
      email: "sam@corp.com",
      slot: "Tue 14:00",
      topic: "Platform strategy",
      message: "Looking forward to it.",
      token: "exec-tok",
    });
    const payload = lastPayload();
    expect(payload.to).toBe(SITE.email);
    expect(payload.subject).toBe("Demo request from Sam Exec");
    expect(payload.text).toContain("Preferred slot: Tue 14:00");
    expect(payload.text).toContain("Focus: Platform strategy");
    expect(payload.replyTo).toBe("sam@corp.com");
  });

  it("omits the optional topic and message blocks when empty", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveDemoToOwner({
      name: "Sam",
      email: "sam@corp.com",
      slot: "Tue 14:00",
      topic: "",
      message: "",
      token: "exec-tok",
    });
    const payload = lastPayload();
    expect(payload.text).not.toContain("Focus:");
    expect(payload.text).not.toContain("Notes:");
    expect(payload.html).not.toContain("background:#f4f4f5");
  });

  it("escapes hostile slot/topic input in the HTML", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveDemoToOwner({
      name: "Sam",
      email: "sam@corp.com",
      slot: "<script>x</script>",
      topic: "a & b",
      message: "",
      token: "exec-tok",
    });
    const { html } = lastPayload();
    expect(html).not.toContain("<script>x</script>");
    expect(html).toContain("&lt;script&gt;x&lt;/script&gt;");
    expect(html).toContain("a &amp; b");
  });
});

describe("sendExecutiveRepoToOwner", () => {
  it("emails the owner with the repo subject and repositories", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveRepoToOwner({
      name: "Sam",
      email: "sam@corp.com",
      repos: "acme/api, acme/web",
      purpose: "Due diligence",
      message: "Thanks!",
      token: "exec-tok",
    });
    const payload = lastPayload();
    expect(payload.to).toBe(SITE.email);
    expect(payload.subject).toBe("Repo access request from Sam");
    expect(payload.text).toContain("Repositories / projects: acme/api, acme/web");
    expect(payload.text).toContain("Purpose: Due diligence");
    expect(payload.replyTo).toBe("sam@corp.com");
  });

  it("omits optional purpose and message blocks when empty", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveRepoToOwner({
      name: "Sam",
      email: "sam@corp.com",
      repos: "acme/api",
      purpose: "",
      message: "",
      token: "exec-tok",
    });
    const payload = lastPayload();
    expect(payload.text).not.toContain("Purpose:");
    expect(payload.text).not.toContain("Notes:");
    expect(payload.html).not.toContain("background:#f4f4f5");
  });
});

describe("sendExecutiveReceipt", () => {
  it("demo: subject and body reference a demo request", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveReceipt("sam@corp.com", "Sam", "demo");
    const payload = lastPayload();
    expect(payload.to).toBe("sam@corp.com");
    expect(payload.subject).toBe("Your demo request is in");
    expect(payload.html).toContain("demo request");
  });

  it("repo: subject and body reference a repo access request", async () => {
    const mod = await loadModule();
    await mod.sendExecutiveReceipt("sam@corp.com", "Sam", "repo");
    const payload = lastPayload();
    expect(payload.subject).toBe("Your repo access request is in");
    expect(payload.html).toContain("repo access request");
  });
});

describe("sendContactToOwner", () => {
  it("emails the owner with a subject naming the sender and intent", async () => {
    const mod = await loadModule();
    await mod.sendContactToOwner({
      name: "Dana Client",
      email: "dana@studio.io",
      intent: "Contract",
      message: "We have a three-month React build.",
    });
    const payload = lastPayload();
    expect(payload.to).toBe(SITE.email);
    expect(payload.subject).toBe("New enquiry from Dana Client (Contract)");
    expect(payload.text).toContain("dana@studio.io");
    expect(payload.text).toContain("About: Contract");
    expect(payload.text).toContain("We have a three-month React build.");
    expect(payload.replyTo).toBe("dana@studio.io");
  });

  it("HTML-escapes hostile name, email and message", async () => {
    const mod = await loadModule();
    await mod.sendContactToOwner({
      name: "<b>x</b>",
      email: "a&b@x.io",
      intent: "Freelance",
      message: '<script>alert("hi")</script>',
    });
    const { html } = lastPayload();
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
    expect(html).toContain("&amp;");
  });
});

describe("missing RESEND_API_KEY (dev fallback)", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    (process.env as Record<string, string>).NODE_ENV = "test";
  });

  it("resolves without throwing and never calls the transport", async () => {
    const mod = await loadModule();
    await expect(mod.sendGuestReceipt("jordan@acme.co", "Jordan")).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY missing"));
  });
});

describe("missing RESEND_API_KEY (production)", () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    (process.env as Record<string, string>).NODE_ENV = "production";
  });

  it("throws instead of silently swallowing", async () => {
    const mod = await loadModule();
    await expect(mod.sendGuestReceipt("jordan@acme.co", "Jordan")).rejects.toThrow(
      "RESEND_API_KEY missing",
    );
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("transport error handling", () => {
  it("dev: swallows a Resend error and logs a warning", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "boom" } });
    (process.env as Record<string, string>).NODE_ENV = "test";
    const mod = await loadModule();
    await expect(mod.sendGuestReceipt("jordan@acme.co", "Jordan")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("boom"));
  });

  it("production: rethrows the Resend error message", async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: "boom" } });
    (process.env as Record<string, string>).NODE_ENV = "production";
    const mod = await loadModule();
    await expect(mod.sendGuestReceipt("jordan@acme.co", "Jordan")).rejects.toThrow("boom");
  });
});

describe("client caching", () => {
  it("constructs the Resend client only once across multiple sends", async () => {
    const { Resend } = await import("resend");
    const ResendMock = Resend as unknown as jest.Mock;
    ResendMock.mockClear();
    const mod = await loadModule();
    await mod.sendGuestReceipt("a@acme.co", "A");
    await mod.sendGuestReceipt("b@acme.co", "B");
    expect(mockSend).toHaveBeenCalledTimes(2);
    expect(ResendMock).toHaveBeenCalledTimes(1);
  });
});

describe("Reply-To routing", () => {
  it("replies to the guest on the owner's copy, so hitting reply reaches them", async () => {
    const mod = await loadModule();
    await mod.sendGuestRequestToOwner({
      name: "Jordan",
      email: "jordan@acme.co",
      resources: ["cv"],
      message: "",
      token: "tok",
    });
    const p = lastPayload();
    expect(p.to).toBe(SITE.email);
    expect(p.replyTo).toBe("jordan@acme.co");
  });

  it("replies to the owner on guest-facing mail", async () => {
    const mod = await loadModule();
    await mod.sendGuestReceipt("jordan@acme.co", "Jordan");
    expect(lastPayload().replyTo).toBe(SITE.email);

    await mod.sendGuestDecision("jordan@acme.co", "Jordan", true, new Date("2026-07-18T21:17:00Z"));
    expect(lastPayload().replyTo).toBe(SITE.email);

    await mod.sendGuestDecision("jordan@acme.co", "Jordan", false);
    expect(lastPayload().replyTo).toBe(SITE.email);
  });

  it("never sends a no-reply sender: every mail carries a Reply-To", async () => {
    const mod = await loadModule();
    await mod.sendContactToOwner({
      name: "Dana",
      email: "dana@studio.io",
      intent: "Contract",
      message: "hi",
    });
    await mod.sendExecutiveReceipt("dana@studio.io", "Dana", "demo");
    for (const call of mockSend.mock.calls) {
      expect((call[0] as SendPayload).replyTo).toBeTruthy();
    }
  });
});
