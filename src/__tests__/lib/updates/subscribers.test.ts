import { db } from "@/lib/db";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy/policy";
import { sendConfirmation } from "@/lib/updates/email";
import {
  CONFIRM_TTL_MS,
  PENDING_RETENTION_MS,
  confirm,
  purgeStalePending,
  subscribe,
  unsubscribe,
} from "@/lib/updates/subscribers";
import { hashToken } from "@/lib/updates/token";

jest.mock("@/lib/db", () => ({
  db: {
    updateSubscriber: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// The real module pulls in the Resend SDK; only the link shape matters here.
jest.mock("@/lib/updates/email", () => ({
  linksFor: (confirmToken: string, unsubscribeToken: string) => ({
    confirmUrl: `https://mzwakhe.test/updates/confirm?token=${confirmToken}`,
    unsubscribeUrl: `https://mzwakhe.test/updates/unsubscribe?token=${unsubscribeToken}`,
    oneClickUrl: `https://mzwakhe.test/api/updates/unsubscribe?token=${unsubscribeToken}`,
  }),
  sendConfirmation: jest.fn(),
}));

const table = db.updateSubscriber as unknown as Record<
  "findUnique" | "upsert" | "update" | "deleteMany",
  jest.Mock
>;
const send = sendConfirmation as jest.Mock;
const NOW = new Date("2026-11-05T12:00:00Z");

/** The raw tokens from the links in the last confirmation email. */
function sentTokens(): { confirm: string; unsubscribe: string } {
  const links = send.mock.calls.at(-1)[1];
  return {
    confirm: new URL(links.confirmUrl).searchParams.get("token") as string,
    unsubscribe: new URL(links.unsubscribeUrl).searchParams.get("token") as string,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  table.upsert.mockResolvedValue({});
  table.update.mockResolvedValue({});
  send.mockResolvedValue(undefined);
});

describe("subscribe", () => {
  it("records a new pending sign-up with consent details and hashed tokens, then emails the raw tokens", async () => {
    table.findUnique.mockResolvedValue(null);
    await subscribe("name@company.com", NOW);

    const { where, create, update } = table.upsert.mock.calls[0][0];
    expect(where).toEqual({ email: "name@company.com" });
    expect(create).toMatchObject({
      email: "name@company.com",
      status: "pending",
      policyVersion: PRIVACY_POLICY_VERSION,
      consentedAt: NOW,
      confirmExpiresAt: new Date(NOW.getTime() + CONFIRM_TTL_MS),
    });
    expect(update).not.toHaveProperty("status");

    const tokens = sentTokens();
    expect(send).toHaveBeenCalledWith("name@company.com", expect.any(Object));
    expect(create.confirmTokenHash).toBe(hashToken(tokens.confirm));
    expect(create.unsubscribeTokenHash).toBe(hashToken(tokens.unsubscribe));
    expect(JSON.stringify(create)).not.toContain(tokens.confirm);
  });

  it("re-issues fresh tokens and resends for an address that is still pending", async () => {
    table.findUnique.mockResolvedValue({ id: "s1", email: "a@b.co", status: "pending" });
    await subscribe("a@b.co", NOW);
    const { update } = table.upsert.mock.calls[0][0];
    expect(update.confirmTokenHash).toBe(hashToken(sentTokens().confirm));
    expect(update.consentedAt).toEqual(NOW);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("leaves a confirmed address alone and sends nothing", async () => {
    table.findUnique.mockResolvedValue({ id: "s1", email: "a@b.co", status: "confirmed" });
    await subscribe("a@b.co", NOW);
    expect(table.upsert).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("surfaces an email failure so the caller can answer with a retryable error", async () => {
    table.findUnique.mockResolvedValue(null);
    send.mockRejectedValue(new Error("resend down"));
    await expect(subscribe("a@b.co", NOW)).rejects.toThrow("resend down");
  });
});

describe("confirm", () => {
  it("confirms a valid token once, clearing it so it cannot be used again", async () => {
    table.findUnique.mockResolvedValue({
      id: "s1",
      confirmExpiresAt: new Date(NOW.getTime() + 1000),
    });
    expect(await confirm("tok", NOW)).toBe("confirmed");
    expect(table.findUnique).toHaveBeenCalledWith({
      where: { confirmTokenHash: hashToken("tok") },
    });
    expect(table.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: {
        status: "confirmed",
        confirmedAt: NOW,
        confirmTokenHash: null,
        confirmExpiresAt: null,
      },
    });
  });

  it("reports an expired token without confirming", async () => {
    table.findUnique.mockResolvedValue({ id: "s1", confirmExpiresAt: new Date(NOW.getTime() - 1) });
    expect(await confirm("tok", NOW)).toBe("expired");
    expect(table.update).not.toHaveBeenCalled();
  });

  it("treats a token with no expiry as expired", async () => {
    table.findUnique.mockResolvedValue({ id: "s1", confirmExpiresAt: null });
    expect(await confirm("tok", NOW)).toBe("expired");
  });

  it("reports an unknown or already used token as invalid", async () => {
    table.findUnique.mockResolvedValue(null);
    expect(await confirm("tok", NOW)).toBe("invalid");
  });
});

describe("unsubscribe", () => {
  it("deletes the row behind the token", async () => {
    table.deleteMany.mockResolvedValue({ count: 1 });
    expect(await unsubscribe("tok")).toBe("removed");
    expect(table.deleteMany).toHaveBeenCalledWith({
      where: { unsubscribeTokenHash: hashToken("tok") },
    });
  });

  it("reports an unknown token as invalid", async () => {
    table.deleteMany.mockResolvedValue({ count: 0 });
    expect(await unsubscribe("tok")).toBe("invalid");
  });
});

describe("purgeStalePending", () => {
  it("deletes pending sign-ups untouched for longer than the retention window", async () => {
    table.deleteMany.mockResolvedValue({ count: 3 });
    expect(await purgeStalePending(NOW)).toBe(3);
    expect(table.deleteMany).toHaveBeenCalledWith({
      where: {
        status: "pending",
        updatedAt: { lt: new Date(NOW.getTime() - PENDING_RETENTION_MS) },
      },
    });
  });
});
