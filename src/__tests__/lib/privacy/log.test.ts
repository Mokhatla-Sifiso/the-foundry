import { createHash } from "node:crypto";
import { COOKIE_POLICY_VERSION } from "@/lib/privacy/policy";

const createMock = jest.fn();
const headersGet = jest.fn();

jest.mock("@/lib/db", () => ({
  db: { consentLog: { create: (...args: unknown[]) => createMock(...args) } },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({ get: (name: string) => headersGet(name) })),
}));

import { logConsent } from "@/lib/privacy/log";

function expectedClientId(ip: string | null, ua: string | null): string {
  return createHash("sha256")
    .update(`${ip ?? "unknown"}|${ua ?? "unknown"}`)
    .digest("hex");
}

/** Configure the mocked headers().get() for one call. */
function withHeaders(map: Record<string, string | null>): void {
  headersGet.mockImplementation((name: string) =>
    Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null,
  );
}

describe("logConsent", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue(undefined);
    headersGet.mockReset();
  });

  it("writes a consent row scoped to a userId (no clientId)", async () => {
    withHeaders({
      "x-forwarded-for": "203.0.113.5, 10.0.0.1",
      "user-agent": "jest-ua",
    });

    await logConsent({ userId: "user_123", action: "grant", payload: { ok: true } });

    expect(createMock).toHaveBeenCalledTimes(1);
    const { data } = createMock.mock.calls[0][0];
    expect(data).toEqual({
      userId: "user_123",
      clientId: null,
      action: "grant",
      payload: { ok: true },
      policyVer: COOKIE_POLICY_VERSION,
      ipAddress: "203.0.113.5",
      userAgent: "jest-ua",
    });
  });

  it("takes the first entry of x-forwarded-for and trims it", async () => {
    withHeaders({
      "x-forwarded-for": "  198.51.100.9 , 198.51.100.10 ",
      "user-agent": "ua",
    });

    await logConsent({ userId: "u1", action: "update", payload: {} });

    expect(createMock.mock.calls[0][0].data.ipAddress).toBe("198.51.100.9");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    withHeaders({ "x-real-ip": "192.0.2.44", "user-agent": "ua" });

    await logConsent({ userId: "u1", action: "withdraw", payload: {} });

    expect(createMock.mock.calls[0][0].data.ipAddress).toBe("192.0.2.44");
  });

  it("records a null ip when neither header is present", async () => {
    withHeaders({ "user-agent": "ua" });

    await logConsent({ userId: "u1", action: "accept_terms", payload: {} });

    expect(createMock.mock.calls[0][0].data.ipAddress).toBeNull();
  });

  it("hashes ip + ua into clientId when there is no userId", async () => {
    withHeaders({ "x-forwarded-for": "203.0.113.5", "user-agent": "anon-ua" });

    await logConsent({ action: "accept_privacy", payload: { a: 1 } });

    const { data } = createMock.mock.calls[0][0];
    expect(data.userId).toBeNull();
    expect(data.clientId).toBe(expectedClientId("203.0.113.5", "anon-ua"));
    expect(data.ipAddress).toBe("203.0.113.5");
    expect(data.userAgent).toBe("anon-ua");
  });

  it("treats an explicit null userId as anonymous and hashes a client id", async () => {
    withHeaders({});

    await logConsent({ userId: null, action: "grant", payload: {} });

    const { data } = createMock.mock.calls[0][0];
    expect(data.userId).toBeNull();
    // ip and ua are both null -> hashes the "unknown|unknown" fallback
    expect(data.clientId).toBe(expectedClientId(null, null));
    expect(data.userAgent).toBeNull();
  });

  it("always stamps the current policy version", async () => {
    withHeaders({ "user-agent": "ua" });

    await logConsent({ userId: "u1", action: "grant", payload: {} });

    expect(createMock.mock.calls[0][0].data.policyVer).toBe(COOKIE_POLICY_VERSION);
  });
});
