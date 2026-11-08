/**
 * @jest-environment node
 */
import { hasAcceptedAgreements, startOtp, verifyOtp } from "@/lib/access/otp";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { logConsent } from "@/lib/privacy/log";
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from "@/lib/privacy/policy";
import { rateLimit, clientIp } from "@/lib/rate-limit";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => new Headers({ "x-forwarded-for": "1.2.3.4", "user-agent": "jest" })),
}));
jest.mock("@/lib/auth/server", () => ({
  auth: {
    api: {
      sendVerificationOTP: jest.fn(),
      signInEmailOTP: jest.fn(),
      getSession: jest.fn(),
    },
  },
}));
jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn(async () => true),
  clientIp: jest.fn(() => "1.2.3.4"),
}));
jest.mock("@/lib/db", () => ({
  db: { user: { update: jest.fn() } },
}));
jest.mock("@/lib/privacy/log", () => ({ logConsent: jest.fn() }));

const sendVerificationOTP = auth.api.sendVerificationOTP as unknown as jest.Mock;
const signInEmailOTP = auth.api.signInEmailOTP as unknown as jest.Mock;
const userUpdate = db.user.update as unknown as jest.Mock;
const mockRateLimit = rateLimit as jest.Mock;
const mockClientIp = clientIp as jest.Mock;
const mockLogConsent = logConsent as jest.Mock;

const CONSENT = { acceptedTerms: true, acceptedPrivacy: true } as const;

// Consent rides along by default so each test exercises the thing it names; the
// agreement gate itself is asserted explicitly in its own describe block.
function post(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify({ ...CONSENT, ...body }),
  });
}

function postRaw(body: unknown): Request {
  return new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRateLimit.mockImplementation(async () => true);
  mockClientIp.mockReturnValue("1.2.3.4");
  sendVerificationOTP.mockResolvedValue(undefined);
  userUpdate.mockResolvedValue({});
  mockLogConsent.mockResolvedValue(undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore?.();
});

describe("hasAcceptedAgreements", () => {
  it("passes only when both flags are boolean true", () => {
    expect(hasAcceptedAgreements(CONSENT)).toBe(true);
  });

  it.each([
    ["neither box ticked", {}],
    ["terms only", { acceptedTerms: true }],
    ["privacy only", { acceptedPrivacy: true }],
    ["both explicitly refused", { acceptedTerms: false, acceptedPrivacy: false }],
    ["truthy strings rather than booleans", { acceptedTerms: "true", acceptedPrivacy: "yes" }],
    ["truthy numbers rather than booleans", { acceptedTerms: 1, acceptedPrivacy: 1 }],
  ])("refuses %s", (_label, payload) => {
    expect(hasAcceptedAgreements(payload)).toBe(false);
  });

  it("treats a missing body as a refusal rather than throwing", () => {
    expect(hasAcceptedAgreements(null)).toBe(false);
    expect(hasAcceptedAgreements(undefined)).toBe(false);
  });
});

describe("the agreement gate", () => {
  it("sends no code when startOtp gets no consent", async () => {
    const res = await startOtp(postRaw({ email: "jordan@acme.co", name: "Jordan" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      message: "Please accept the Terms of Use and the Privacy Policy to continue.",
      field: "consent",
    });
    expect(sendVerificationOTP).not.toHaveBeenCalled();
  });

  it("refuses before spending a rate-limit token", async () => {
    await startOtp(postRaw({ email: "jordan@acme.co", name: "Jordan" }), "test");
    expect(mockRateLimit).not.toHaveBeenCalled();
  });

  it("issues no session when a code is replayed straight at verifyOtp without consent", async () => {
    const res = await verifyOtp(postRaw({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      message: "Please accept the Terms of Use and the Privacy Policy to continue.",
      field: "consent",
    });
    expect(signInEmailOTP).not.toHaveBeenCalled();
    expect(mockLogConsent).not.toHaveBeenCalled();
  });

  it("still rejects a malformed email even when both boxes are ticked", async () => {
    const res = await startOtp(post({ email: "nope", name: "Jordan" }), "test");
    expect(res.status).toBe(400);
    expect(sendVerificationOTP).not.toHaveBeenCalled();
  });

  it("records both agreements against the verified user, tagged with the journey", async () => {
    signInEmailOTP.mockResolvedValue({ user: { id: "u1", name: "Jordan" } });
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "executive");
    expect(res.status).toBe(200);
    expect(mockLogConsent).toHaveBeenCalledWith({
      userId: "u1",
      action: "accept_terms",
      payload: { version: TERMS_VERSION, journey: "executive" },
    });
    expect(mockLogConsent).toHaveBeenCalledWith({
      userId: "u1",
      action: "accept_privacy",
      payload: { version: PRIVACY_POLICY_VERSION, journey: "executive" },
    });
  });

  it("logs no consent when the code itself is rejected", async () => {
    signInEmailOTP.mockRejectedValue(new Error("OTP expired"));
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "guest");
    expect(res.status).toBe(401);
    expect(mockLogConsent).not.toHaveBeenCalled();
  });
});

describe("startOtp", () => {
  it("rejects an invalid email with 400", async () => {
    const res = await startOtp(post({ email: "not-an-email", name: "Jordan" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Enter a valid email address." });
    expect(sendVerificationOTP).not.toHaveBeenCalled();
  });

  it("treats a non-string / missing email as invalid (400)", async () => {
    const res = await startOtp(post({ name: "Jordan" }), "test");
    expect(res.status).toBe(400);
  });

  it("returns 400 when the payload is not valid JSON", async () => {
    const req = new Request("http://localhost/api", { method: "POST", body: "{broken" });
    const res = await startOtp(req, "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Enter a valid email address." });
  });

  it("rejects a too-short name with 400", async () => {
    const res = await startOtp(post({ email: "jordan@acme.co", name: "J" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Please enter your name." });
  });

  it("returns 429 when rate limiting denies the request", async () => {
    mockRateLimit.mockImplementation(async () => false);
    const res = await startOtp(post({ email: "jordan@acme.co", name: "Jordan" }), "test");
    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      message: "Too many code requests. Please wait a few minutes and try again.",
    });
    expect(sendVerificationOTP).not.toHaveBeenCalled();
  });

  it("returns 429 when only the email bucket is exhausted", async () => {
    mockRateLimit
      .mockImplementationOnce(async () => true)
      .mockImplementationOnce(async () => false);
    const res = await startOtp(post({ email: "jordan@acme.co", name: "Jordan" }), "test");
    expect(res.status).toBe(429);
  });

  it("sends the code and returns 200 {ok:true} on the happy path", async () => {
    const res = await startOtp(post({ email: "  Jordan@Acme.CO ", name: "  Jordan  " }), "test");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sendVerificationOTP).toHaveBeenCalledWith(
      expect.objectContaining({ body: { email: "jordan@acme.co", type: "sign-in" } }),
    );
  });

  it("returns 500 when sending the code throws", async () => {
    sendVerificationOTP.mockRejectedValue(new Error("smtp down"));
    const res = await startOtp(post({ email: "jordan@acme.co", name: "Jordan" }), "boom");
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ message: "Could not send code." });
    expect(console.error).toHaveBeenCalled();
  });
});

describe("verifyOtp", () => {
  it("rejects a bad email with 400", async () => {
    const res = await verifyOtp(post({ email: "nope", otp: "123456" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Enter a valid email address." });
  });

  it("rejects an otp that is not 6 digits with 400", async () => {
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "12ab" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Enter the 6-digit code." });
  });

  it("treats a non-string / missing email as invalid (400)", async () => {
    const res = await verifyOtp(post({ otp: "123456" }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Enter a valid email address." });
  });

  it("treats a non-string / missing otp as invalid (400)", async () => {
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: 123456 }), "test");
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "Enter the 6-digit code." });
  });

  it("returns 429 when the verify bucket is exhausted", async () => {
    mockRateLimit.mockImplementation(async () => false);
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      message: "Too many attempts. Please wait a few minutes and try again.",
    });
  });

  it("maps an expired-code error to a friendly 401", async () => {
    signInEmailOTP.mockRejectedValue(new Error("OTP expired"));
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: "That code doesn't match. Try again." });
  });

  it("maps an unrecognised error to a generic 401", async () => {
    signInEmailOTP.mockRejectedValue(new Error("network exploded"));
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      message: "Could not verify the code. Try again.",
    });
  });

  it("maps a non-Error rejection to a generic 401", async () => {
    signInEmailOTP.mockRejectedValue("string failure");
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({
      message: "Could not verify the code. Try again.",
    });
  });

  it("returns 401 when the session has no user id", async () => {
    signInEmailOTP.mockResolvedValue({ user: null });
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: "That code doesn't match. Try again." });
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("updates the user name when it differs and returns 200", async () => {
    signInEmailOTP.mockResolvedValue({ user: { id: "u1", name: "Old Name" } });
    const res = await verifyOtp(
      post({ email: "jordan@acme.co", otp: "123456", name: "Jordan" }),
      "test",
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "Jordan", emailVerified: true },
    });
  });

  it("swallows a failing name update and still returns 200", async () => {
    signInEmailOTP.mockResolvedValue({ user: { id: "u1", name: "Old Name" } });
    userUpdate.mockRejectedValue(new Error("db offline"));
    const res = await verifyOtp(
      post({ email: "jordan@acme.co", otp: "123456", name: "Jordan" }),
      "test",
    );
    expect(res.status).toBe(200);
  });

  it("does not update when the provided name matches the session", async () => {
    signInEmailOTP.mockResolvedValue({ user: { id: "u1", name: "Jordan" } });
    const res = await verifyOtp(
      post({ email: "jordan@acme.co", otp: "123456", name: "Jordan" }),
      "test",
    );
    expect(res.status).toBe(200);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("does not update when no name is supplied", async () => {
    signInEmailOTP.mockResolvedValue({ user: { id: "u1", name: "Jordan" } });
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "test");
    expect(res.status).toBe(200);
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("returns 500 when an unexpected error escapes the inner handler", async () => {
    mockRateLimit.mockImplementation(async () => {
      throw new Error("redis exploded");
    });
    const res = await verifyOtp(post({ email: "jordan@acme.co", otp: "123456" }), "boom");
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ message: "Could not verify the code." });
    expect(console.error).toHaveBeenCalled();
  });
});
