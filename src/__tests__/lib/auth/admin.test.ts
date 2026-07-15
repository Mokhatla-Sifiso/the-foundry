import { isWhitelisted, getSessionContext, requireAdmin, HttpError } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/server";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => new Headers({ "x-forwarded-for": "1.2.3.4", "user-agent": "jest" })),
}));
jest.mock("@/lib/auth/server", () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock("@/lib/db", () => ({
  db: { adminWhitelist: { findUnique: jest.fn() } },
}));

const getSession = auth.api.getSession as unknown as jest.Mock;
const whitelistFind = db.adminWhitelist.findUnique as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("isWhitelisted", () => {
  it("returns true when a whitelist entry exists (normalising the email)", async () => {
    whitelistFind.mockResolvedValue({ email: "admin@acme.co" });
    await expect(isWhitelisted("  Admin@Acme.CO ")).resolves.toBe(true);
    expect(whitelistFind).toHaveBeenCalledWith({ where: { email: "admin@acme.co" } });
  });

  it("returns false when no whitelist entry exists", async () => {
    whitelistFind.mockResolvedValue(null);
    await expect(isWhitelisted("nobody@acme.co")).resolves.toBe(false);
  });
});

describe("getSessionContext", () => {
  it("returns null when there is no session", async () => {
    getSession.mockResolvedValue(null);
    await expect(getSessionContext()).resolves.toBeNull();
  });

  it("returns null when the session has no user", async () => {
    getSession.mockResolvedValue({ user: null });
    await expect(getSessionContext()).resolves.toBeNull();
  });

  it("returns an admin context when the user is whitelisted", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", email: "admin@acme.co", name: "Admin" },
    });
    whitelistFind.mockResolvedValue({ email: "admin@acme.co" });
    await expect(getSessionContext()).resolves.toEqual({
      userId: "u1",
      email: "admin@acme.co",
      name: "Admin",
      isAdmin: true,
    });
  });

  it("defaults a missing name to an empty string and marks non-admins", async () => {
    getSession.mockResolvedValue({
      user: { id: "u2", email: "jordan@acme.co", name: null },
    });
    whitelistFind.mockResolvedValue(null);
    await expect(getSessionContext()).resolves.toEqual({
      userId: "u2",
      email: "jordan@acme.co",
      name: "",
      isAdmin: false,
    });
  });
});

describe("requireAdmin", () => {
  it("throws a 401 HttpError when there is no session context", async () => {
    getSession.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toMatchObject({ status: 401, message: "Sign in required" });
  });

  it("throws a 403 HttpError when the user is not an admin", async () => {
    getSession.mockResolvedValue({ user: { id: "u3", email: "jordan@acme.co", name: "Jordan" } });
    whitelistFind.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toMatchObject({
      status: 403,
      message: "Admin access required",
    });
  });

  it("returns the context when the user is an admin", async () => {
    getSession.mockResolvedValue({ user: { id: "u4", email: "admin@acme.co", name: "Admin" } });
    whitelistFind.mockResolvedValue({ email: "admin@acme.co" });
    await expect(requireAdmin()).resolves.toEqual({
      userId: "u4",
      email: "admin@acme.co",
      name: "Admin",
      isAdmin: true,
    });
  });

  it("rejects with an HttpError instance", async () => {
    getSession.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toBeInstanceOf(HttpError);
  });
});

describe("HttpError", () => {
  it("carries the status and message and extends Error", () => {
    const err = new HttpError(418, "teapot");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(418);
    expect(err.message).toBe("teapot");
  });
});
