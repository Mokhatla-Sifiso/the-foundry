import {
  createGuestRequest,
  guestStateForEmail,
  pendingRequestByToken,
  renotifyPendingRequest,
  reviewGuestRequest,
} from "@/lib/access/guest";
import { NotifyError } from "@/lib/access/notify";
import { db } from "@/lib/db";
import { sendGuestDecision, sendGuestReceipt, sendGuestRequestToOwner } from "@/lib/access/email";

jest.mock("@/lib/db", () => ({
  db: {
    accessRequest: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/access/email", () => ({
  sendGuestRequestToOwner: jest.fn(),
  sendGuestReceipt: jest.fn(),
  sendGuestDecision: jest.fn(),
}));

const accessRequest = db.accessRequest as unknown as {
  create: jest.Mock;
  findFirst: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
};

const DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(() => {
  jest.clearAllMocks();
  accessRequest.create.mockResolvedValue({});
  accessRequest.update.mockResolvedValue({});
});

describe("createGuestRequest", () => {
  const base = {
    email: "guest@acme.co",
    name: "Guest User",
    resources: ["cv", "repos"] as ReadonlyArray<string>,
    message: "Please and thank you",
    ip: "203.0.113.1",
    ua: "jest-agent",
  };

  it("persists a pending guest request with a generated review token", async () => {
    await createGuestRequest(base);

    expect(accessRequest.create).toHaveBeenCalledTimes(1);
    const arg = accessRequest.create.mock.calls[0][0];
    expect(arg.data).toEqual(
      expect.objectContaining({
        email: "guest@acme.co",
        name: "Guest User",
        tier: "guest",
        kind: "resource",
        detail: { resources: ["cv", "repos"] },
        message: "Please and thank you",
        status: "pending",
        ipAddress: "203.0.113.1",
        userAgent: "jest-agent",
      }),
    );
    expect(typeof arg.data.reviewToken).toBe("string");
    expect(arg.data.reviewToken.length).toBeGreaterThan(0);
  });

  it("notifies the owner and sends the requester a receipt with the same token", async () => {
    await createGuestRequest(base);

    const token = accessRequest.create.mock.calls[0][0].data.reviewToken;
    expect(sendGuestRequestToOwner).toHaveBeenCalledWith({
      name: "Guest User",
      email: "guest@acme.co",
      resources: ["cv", "repos"],
      message: "Please and thank you",
      token,
    });
    expect(sendGuestReceipt).toHaveBeenCalledWith("guest@acme.co", "Guest User");
  });

  it("stores a null message when the requester leaves it blank", async () => {
    await createGuestRequest({ ...base, message: "" });
    expect(accessRequest.create.mock.calls[0][0].data.message).toBeNull();
  });
});

describe("guestStateForEmail", () => {
  it("reports 'none' when the visitor has never requested access", async () => {
    accessRequest.findFirst.mockResolvedValue(null);
    await expect(guestStateForEmail("nobody@acme.co")).resolves.toEqual({
      status: "none",
      expiresAt: null,
      resources: [],
    });
    expect(accessRequest.findFirst).toHaveBeenCalledWith({
      where: { email: "nobody@acme.co", tier: "guest" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns the pending status with parsed resources and no expiry", async () => {
    accessRequest.findFirst.mockResolvedValue({
      status: "pending",
      expiresAt: null,
      detail: { resources: ["cv", "cases", 7, null, "repos"] },
    });
    await expect(guestStateForEmail("pending@acme.co")).resolves.toEqual({
      status: "pending",
      expiresAt: null,
      resources: ["cv", "cases", "repos"],
    });
  });

  it("keeps an approved grant that has not yet expired", async () => {
    const expiresAt = new Date(Date.now() + 5 * DAY_MS);
    accessRequest.findFirst.mockResolvedValue({
      status: "approved",
      expiresAt,
      detail: { resources: ["cv"] },
    });
    await expect(guestStateForEmail("live@acme.co")).resolves.toEqual({
      status: "approved",
      expiresAt: expiresAt.getTime(),
      resources: ["cv"],
    });
  });

  it("downgrades an approved-but-lapsed grant to 'expired'", async () => {
    const expiresAt = new Date(Date.now() - DAY_MS);
    accessRequest.findFirst.mockResolvedValue({
      status: "approved",
      expiresAt,
      detail: { resources: ["cv"] },
    });
    await expect(guestStateForEmail("stale@acme.co")).resolves.toEqual({
      status: "expired",
      expiresAt: expiresAt.getTime(),
      resources: ["cv"],
    });
  });

  it("treats a missing or non-array detail as an empty resource list", async () => {
    accessRequest.findFirst.mockResolvedValue({
      status: "rejected",
      expiresAt: null,
      detail: null,
    });
    await expect(guestStateForEmail("rej@acme.co")).resolves.toEqual({
      status: "rejected",
      expiresAt: null,
      resources: [],
    });

    accessRequest.findFirst.mockResolvedValue({
      status: "rejected",
      expiresAt: null,
      detail: { resources: "not-an-array" },
    });
    await expect(guestStateForEmail("rej2@acme.co")).resolves.toEqual({
      status: "rejected",
      expiresAt: null,
      resources: [],
    });
  });
});

describe("reviewGuestRequest", () => {
  it("rejects an unknown token as invalid or already used", async () => {
    accessRequest.findUnique.mockResolvedValue(null);
    await expect(reviewGuestRequest("missing", "approve")).resolves.toEqual({
      ok: false,
      message: "This link is invalid or has already been used.",
    });
    expect(accessRequest.update).not.toHaveBeenCalled();
    expect(sendGuestDecision).not.toHaveBeenCalled();
  });

  it("refuses to re-decide a request that is no longer pending", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-1",
      email: "g@acme.co",
      name: "Gina",
      status: "approved",
    });
    await expect(reviewGuestRequest("tok", "reject")).resolves.toEqual({
      ok: false,
      message: "This request was already approved.",
    });
    expect(accessRequest.update).not.toHaveBeenCalled();
  });

  it("approves a pending request, sets a 24-hour expiry, and clears the token", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-2",
      email: "gina@acme.co",
      name: "Gina",
      status: "pending",
    });

    const result = await reviewGuestRequest("tok", "approve");

    expect(result).toEqual({ ok: true, message: "Approved. Gina now has 24-hour access." });
    const updateArg = accessRequest.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: "req-2" });
    expect(updateArg.data.status).toBe("approved");
    expect(updateArg.data.reviewToken).toBeNull();
    expect(updateArg.data.decidedAt).toBeInstanceOf(Date);
    expect(updateArg.data.expiresAt).toBeInstanceOf(Date);
    const grantMs = updateArg.data.expiresAt.getTime() - updateArg.data.decidedAt.getTime();
    expect(grantMs).toBe(24 * 60 * 60 * 1000);

    expect(sendGuestDecision).toHaveBeenCalledWith(
      "gina@acme.co",
      "Gina",
      true,
      updateArg.data.expiresAt,
    );
  });

  it("rejects a pending request without granting an expiry", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-3",
      email: "rob@acme.co",
      name: "Rob",
      status: "pending",
    });

    const result = await reviewGuestRequest("tok", "reject");

    expect(result).toEqual({ ok: true, message: "Rejected Rob's request." });
    const updateArg = accessRequest.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: "req-3" });
    expect(updateArg.data).toEqual(
      expect.objectContaining({ status: "rejected", reviewToken: null }),
    );
    expect(updateArg.data.expiresAt).toBeUndefined();
    expect(sendGuestDecision).toHaveBeenCalledWith("rob@acme.co", "Rob", false);
  });
});

describe("pendingRequestByToken", () => {
  it("returns null when the token matches nothing", async () => {
    accessRequest.findUnique.mockResolvedValue(null);
    await expect(pendingRequestByToken("nope")).resolves.toBeNull();
  });

  it("returns null when the matched request is not pending", async () => {
    accessRequest.findUnique.mockResolvedValue({ status: "approved" });
    await expect(pendingRequestByToken("tok")).resolves.toBeNull();
  });

  it("summarises a pending request with its parsed resource list", async () => {
    accessRequest.findUnique.mockResolvedValue({
      status: "pending",
      name: "Priya",
      email: "priya@acme.co",
      message: "Evaluating for a role",
      detail: { resources: ["cv", 1, "references"] },
    });
    await expect(pendingRequestByToken("tok")).resolves.toEqual({
      name: "Priya",
      email: "priya@acme.co",
      resources: ["cv", "references"],
      message: "Evaluating for a role",
    });
  });

  it("defaults resources to an empty list when detail is absent", async () => {
    accessRequest.findUnique.mockResolvedValue({
      status: "pending",
      name: "Sam",
      email: "sam@acme.co",
      message: null,
      detail: null,
    });
    await expect(pendingRequestByToken("tok")).resolves.toEqual({
      name: "Sam",
      email: "sam@acme.co",
      resources: [],
      message: null,
    });
  });
});

describe("notification resilience", () => {
  const base = {
    email: "guest@acme.co",
    name: "Guest User",
    resources: ["cv"] as ReadonlyArray<string>,
    message: "",
    ip: null,
    ua: null,
  };

  it("still notifies the owner when the guest's receipt fails to send", async () => {
    (sendGuestReceipt as jest.Mock).mockRejectedValueOnce(new Error("recipient not allowed"));

    await expect(createGuestRequest(base)).resolves.toBeUndefined();
    expect(sendGuestRequestToOwner).toHaveBeenCalledTimes(1);
  });

  it("raises NotifyError when the owner cannot be told the request exists", async () => {
    (sendGuestRequestToOwner as jest.Mock).mockRejectedValueOnce(new Error("domain not verified"));

    await expect(createGuestRequest(base)).rejects.toBeInstanceOf(NotifyError);
    // The row is still written: the request is real even when the email is not.
    expect(accessRequest.create).toHaveBeenCalledTimes(1);
  });
});

describe("renotifyPendingRequest", () => {
  it("re-sends the owner notification for a pending request, reusing its review token", async () => {
    accessRequest.findFirst.mockResolvedValue({
      email: "gina@acme.co",
      name: "Gina",
      detail: { resources: ["cv", "references"] },
      message: "still waiting",
      reviewToken: "tok-existing",
      status: "pending",
    });

    await renotifyPendingRequest("gina@acme.co");

    expect(sendGuestRequestToOwner).toHaveBeenCalledWith({
      name: "Gina",
      email: "gina@acme.co",
      resources: ["cv", "references"],
      message: "still waiting",
      token: "tok-existing",
    });
  });

  it("does nothing when there is no pending request to re-notify", async () => {
    accessRequest.findFirst.mockResolvedValue(null);

    await renotifyPendingRequest("nobody@acme.co");

    expect(sendGuestRequestToOwner).not.toHaveBeenCalled();
  });
});
