import { fetchAccount } from "@/lib/auth/profile";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: jest.fn() },
    adminWhitelist: { findUnique: jest.fn() },
  },
}));

const userFind = db.user.findUnique as unknown as jest.Mock;
const whitelistFind = db.adminWhitelist.findUnique as unknown as jest.Mock;

const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");
const VERIFIED_AT = new Date("2026-02-02T00:00:00.000Z");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchAccount", () => {
  it("returns null when the user does not exist", async () => {
    userFind.mockResolvedValue(null);
    await expect(fetchAccount("missing")).resolves.toBeNull();
    expect(whitelistFind).not.toHaveBeenCalled();
  });

  it("maps a recruiter with a profile, using the profile verifiedAt and decision", async () => {
    userFind.mockResolvedValue({
      name: "Jordan",
      email: "jordan@acme.co",
      createdAt: CREATED_AT,
      recruiterProfile: {
        company: "Acme",
        role: "Talent Partner",
        url: "acme.co",
        verifiedAt: VERIFIED_AT,
        decision: "approve",
        reason: "Looks legit.",
      },
    });
    whitelistFind.mockResolvedValue(null);

    await expect(fetchAccount("u1")).resolves.toEqual({
      name: "Jordan",
      email: "jordan@acme.co",
      company: "Acme",
      role: "Talent Partner",
      url: "acme.co",
      verifiedAt: VERIFIED_AT.getTime(),
      isAdmin: false,
      screen: { decision: "approve", reason: "Looks legit." },
    });
  });

  it("defaults a null profile reason to an empty string", async () => {
    userFind.mockResolvedValue({
      name: "Jordan",
      email: "jordan@acme.co",
      createdAt: CREATED_AT,
      recruiterProfile: {
        company: "Acme",
        role: "Talent Partner",
        url: "acme.co",
        verifiedAt: VERIFIED_AT,
        decision: "pending",
        reason: null,
      },
    });
    whitelistFind.mockResolvedValue(null);

    const result = await fetchAccount("u1");
    expect(result?.screen).toEqual({ decision: "pending", reason: "" });
  });

  it("falls back to createdAt and empty fields when there is no profile and no admin entry", async () => {
    userFind.mockResolvedValue({
      name: "Jordan",
      email: "jordan@acme.co",
      createdAt: CREATED_AT,
      recruiterProfile: null,
    });
    whitelistFind.mockResolvedValue(null);

    await expect(fetchAccount("u2")).resolves.toEqual({
      name: "Jordan",
      email: "jordan@acme.co",
      company: "",
      role: "",
      url: "",
      verifiedAt: CREATED_AT.getTime(),
      isAdmin: false,
      screen: null,
    });
  });

  it("marks an admin without a profile as approved via the allowlist", async () => {
    userFind.mockResolvedValue({
      name: "Admin",
      email: "admin@acme.co",
      createdAt: CREATED_AT,
      recruiterProfile: null,
    });
    whitelistFind.mockResolvedValue({ email: "admin@acme.co" });

    await expect(fetchAccount("u3")).resolves.toEqual({
      name: "Admin",
      email: "admin@acme.co",
      company: "",
      role: "Admin",
      url: "",
      verifiedAt: CREATED_AT.getTime(),
      isAdmin: true,
      screen: { decision: "approve", reason: "Admin allowlist." },
    });
  });

  it("prefers the profile screen over the admin allowlist when both exist", async () => {
    userFind.mockResolvedValue({
      name: "Admin",
      email: "admin@acme.co",
      createdAt: CREATED_AT,
      recruiterProfile: {
        company: "Acme",
        role: "Recruiter",
        url: "acme.co",
        verifiedAt: VERIFIED_AT,
        decision: "reject",
        reason: "Duplicate.",
      },
    });
    whitelistFind.mockResolvedValue({ email: "admin@acme.co" });

    const result = await fetchAccount("u4");
    expect(result?.isAdmin).toBe(true);
    expect(result?.role).toBe("Recruiter");
    expect(result?.screen).toEqual({ decision: "reject", reason: "Duplicate." });
  });
});
