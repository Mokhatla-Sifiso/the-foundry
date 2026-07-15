import { cvGrantFor } from "@/lib/access/entitlement";
import type { SessionContext } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { guestStateForEmail } from "@/lib/access/guest";
import type { GuestState } from "@/lib/access/guest";

jest.mock("@/lib/db", () => ({
  db: {
    recruiterProfile: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/access/guest", () => ({
  guestStateForEmail: jest.fn(),
}));

const recruiterProfile = db.recruiterProfile as unknown as { findUnique: jest.Mock };
const guestState = guestStateForEmail as unknown as jest.Mock;

function ctx(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    userId: "user-1",
    email: "visitor@acme.co",
    name: "Visitor",
    isAdmin: false,
    ...overrides,
  };
}

function guest(overrides: Partial<GuestState> = {}): GuestState {
  return { status: "none", expiresAt: null, resources: [], ...overrides };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("cvGrantFor", () => {
  it("grants 'admin' immediately and skips all lookups for an admin", async () => {
    await expect(cvGrantFor(ctx({ isAdmin: true }))).resolves.toBe("admin");
    expect(recruiterProfile.findUnique).not.toHaveBeenCalled();
    expect(guestState).not.toHaveBeenCalled();
  });

  it("grants 'recruiter' when the user has an approved recruiter profile", async () => {
    recruiterProfile.findUnique.mockResolvedValue({ decision: "approve" });

    await expect(cvGrantFor(ctx())).resolves.toBe("recruiter");
    expect(recruiterProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { decision: true },
    });
    expect(guestState).not.toHaveBeenCalled();
  });

  it("grants 'guest' when an approved guest grant includes the cv resource", async () => {
    recruiterProfile.findUnique.mockResolvedValue(null);
    guestState.mockResolvedValue(guest({ status: "approved", resources: ["cv", "repos"] }));

    await expect(cvGrantFor(ctx())).resolves.toBe("guest");
    expect(guestState).toHaveBeenCalledWith("visitor@acme.co");
  });

  it("returns null when the guest grant is approved but excludes the cv", async () => {
    recruiterProfile.findUnique.mockResolvedValue({ decision: "reject" });
    guestState.mockResolvedValue(guest({ status: "approved", resources: ["repos"] }));

    await expect(cvGrantFor(ctx())).resolves.toBeNull();
  });

  it("returns null when the guest holds cv but the grant is not approved", async () => {
    recruiterProfile.findUnique.mockResolvedValue(null);
    guestState.mockResolvedValue(guest({ status: "expired", resources: ["cv"] }));

    await expect(cvGrantFor(ctx())).resolves.toBeNull();
  });

  it("returns null when there is no recruiter profile and no guest access", async () => {
    recruiterProfile.findUnique.mockResolvedValue(null);
    guestState.mockResolvedValue(guest());

    await expect(cvGrantFor(ctx())).resolves.toBeNull();
  });
});
