import {
  createDemoRequest,
  createRepoRequest,
  executiveRequestsForEmail,
  pendingExecutiveByToken,
  reviewExecutiveRequest,
} from "@/lib/access/executive";
import { db } from "@/lib/db";
import {
  sendExecutiveDemoToOwner,
  sendExecutiveReceipt,
  sendExecutiveRepoToOwner,
} from "@/lib/access/email";

jest.mock("@/lib/db", () => ({
  db: {
    accessRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/access/email", () => ({
  sendExecutiveDemoToOwner: jest.fn(),
  sendExecutiveRepoToOwner: jest.fn(),
  sendExecutiveReceipt: jest.fn(),
}));

const accessRequest = db.accessRequest as unknown as {
  create: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  accessRequest.create.mockResolvedValue({});
  accessRequest.update.mockResolvedValue({});
});

describe("createDemoRequest", () => {
  const base = {
    email: "cto@corp.com",
    name: "Casey",
    slot: "Tuesday 3pm",
    topic: "Platform architecture",
    message: "Looking forward to it",
    ip: "198.51.100.7",
    ua: "exec-agent",
  };

  it("persists a pending executive demo request", async () => {
    await createDemoRequest(base);

    expect(accessRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "cto@corp.com",
        name: "Casey",
        tier: "executive",
        kind: "demo",
        detail: { slot: "Tuesday 3pm", topic: "Platform architecture" },
        message: "Looking forward to it",
        status: "pending",
        ipAddress: "198.51.100.7",
        userAgent: "exec-agent",
      }),
    });
  });

  it("emails the owner and a demo receipt to the requester", async () => {
    await createDemoRequest(base);

    expect(sendExecutiveDemoToOwner).toHaveBeenCalledWith({
      name: "Casey",
      email: "cto@corp.com",
      slot: "Tuesday 3pm",
      topic: "Platform architecture",
      message: "Looking forward to it",
      token: expect.any(String),
    });
    expect(sendExecutiveReceipt).toHaveBeenCalledWith("cto@corp.com", "Casey", "demo");
    expect(sendExecutiveRepoToOwner).not.toHaveBeenCalled();
  });

  it("stores a null message when none is provided", async () => {
    await createDemoRequest({ ...base, message: "" });
    expect(accessRequest.create.mock.calls[0][0].data.message).toBeNull();
  });
});

describe("createRepoRequest", () => {
  const base = {
    email: "lead@corp.com",
    name: "Devon",
    repos: "the-foundry, studiosync",
    purpose: "Security review",
    message: "Two-week window",
    ip: null,
    ua: null,
  };

  it("persists a pending executive repo request", async () => {
    await createRepoRequest(base);

    expect(accessRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "lead@corp.com",
        name: "Devon",
        tier: "executive",
        kind: "repo",
        detail: { repos: "the-foundry, studiosync", purpose: "Security review" },
        message: "Two-week window",
        status: "pending",
        ipAddress: null,
        userAgent: null,
      }),
    });
  });

  it("emails the owner and a repo receipt to the requester", async () => {
    await createRepoRequest(base);

    expect(sendExecutiveRepoToOwner).toHaveBeenCalledWith({
      name: "Devon",
      email: "lead@corp.com",
      repos: "the-foundry, studiosync",
      purpose: "Security review",
      message: "Two-week window",
      token: expect.any(String),
    });
    expect(sendExecutiveReceipt).toHaveBeenCalledWith("lead@corp.com", "Devon", "repo");
    expect(sendExecutiveDemoToOwner).not.toHaveBeenCalled();
  });

  it("stores a null message when none is provided", async () => {
    await createRepoRequest({ ...base, message: "" });
    expect(accessRequest.create.mock.calls[0][0].data.message).toBeNull();
  });
});

describe("executiveRequestsForEmail", () => {
  it("reports no requests for an email with no rows", async () => {
    accessRequest.findMany.mockResolvedValue([]);
    await expect(executiveRequestsForEmail("none@corp.com")).resolves.toEqual({
      demo: false,
      repo: false,
    });
    expect(accessRequest.findMany).toHaveBeenCalledWith({
      where: { email: "none@corp.com", tier: "executive" },
      select: { kind: true },
    });
  });

  it("flags only the demo when a demo row exists", async () => {
    accessRequest.findMany.mockResolvedValue([{ kind: "demo" }]);
    await expect(executiveRequestsForEmail("demo@corp.com")).resolves.toEqual({
      demo: true,
      repo: false,
    });
  });

  it("flags both when demo and repo rows exist", async () => {
    accessRequest.findMany.mockResolvedValue([{ kind: "repo" }, { kind: "demo" }]);
    await expect(executiveRequestsForEmail("both@corp.com")).resolves.toEqual({
      demo: true,
      repo: true,
    });
  });
});

describe("pendingExecutiveByToken", () => {
  it("summarises a pending demo request from its detail blob", async () => {
    accessRequest.findUnique.mockResolvedValue({
      tier: "executive",
      kind: "demo",
      status: "pending",
      name: "Casey",
      email: "cto@corp.com",
      detail: { slot: "Tue 22 July 10:00", topic: "architecture" },
      message: "keen",
      createdAt: new Date("2026-07-17T13:42:00Z"),
    });
    await expect(pendingExecutiveByToken("tok")).resolves.toEqual({
      kind: "demo",
      name: "Casey",
      email: "cto@corp.com",
      slot: "Tue 22 July 10:00",
      topic: "architecture",
      repos: "",
      purpose: "",
      message: "keen",
      createdAt: new Date("2026-07-17T13:42:00Z"),
    });
  });

  it("refuses a guest token, since every tier shares the reviewToken column", async () => {
    accessRequest.findUnique.mockResolvedValue({
      tier: "guest",
      kind: "resource",
      status: "pending",
      name: "Gina",
      email: "g@acme.co",
      detail: {},
      message: null,
      createdAt: new Date("2026-07-17T13:42:00Z"),
    });
    await expect(pendingExecutiveByToken("tok")).resolves.toBeNull();
  });
});

describe("reviewExecutiveRequest", () => {
  it("marks a demo handled, stamps the decision, and burns the token", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-9",
      tier: "executive",
      kind: "demo",
      status: "pending",
      name: "Casey",
      email: "cto@corp.com",
    });
    const result = await reviewExecutiveRequest("tok", "approve");
    expect(result).toEqual({ ok: true, message: "Marked Casey's demo request as handled." });
    const arg = accessRequest.update.mock.calls[0][0];
    expect(arg.data.status).toBe("approved");
    expect(arg.data.reviewToken).toBeNull();
    expect(arg.data.decidedAt).toBeInstanceOf(Date);
    // Acknowledged, not granted: nothing is emailed and no window opens.
    expect(arg.data.expiresAt).toBeUndefined();
  });

  it("declines a repo request", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-10",
      tier: "executive",
      kind: "repo",
      status: "pending",
      name: "Rae",
      email: "rae@corp.com",
    });
    await expect(reviewExecutiveRequest("tok", "reject")).resolves.toEqual({
      ok: true,
      message: "Declined Rae's repo access request.",
    });
  });

  it("will not re-decide a request that is already handled", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-11",
      tier: "executive",
      kind: "demo",
      status: "approved",
      name: "Casey",
      email: "cto@corp.com",
    });
    await expect(reviewExecutiveRequest("tok", "approve")).resolves.toEqual({
      ok: false,
      message: "This request was already approved.",
    });
    expect(accessRequest.update).not.toHaveBeenCalled();
  });

  it("refuses a guest token rather than handling it as executive", async () => {
    accessRequest.findUnique.mockResolvedValue({
      id: "req-12",
      tier: "guest",
      kind: "resource",
      status: "pending",
      name: "Gina",
      email: "g@acme.co",
    });
    await expect(reviewExecutiveRequest("tok", "approve")).resolves.toEqual({
      ok: false,
      message: "This link is invalid or has already been used.",
    });
    expect(accessRequest.update).not.toHaveBeenCalled();
  });
});
