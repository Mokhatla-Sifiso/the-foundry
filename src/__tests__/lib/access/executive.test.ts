import {
  createDemoRequest,
  createRepoRequest,
  executiveRequestsForEmail,
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
};

beforeEach(() => {
  jest.clearAllMocks();
  accessRequest.create.mockResolvedValue({});
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
