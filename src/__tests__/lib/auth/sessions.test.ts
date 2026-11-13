import { revokeUserSessions } from "@/lib/auth/sessions";
import { db } from "@/lib/db";

jest.mock("@/lib/db", () => ({
  db: { session: { deleteMany: jest.fn() } },
}));

const session = db.session as unknown as { deleteMany: jest.Mock };

beforeEach(() => jest.clearAllMocks());

describe("revokeUserSessions", () => {
  it("deletes every session row for the user and returns the count", async () => {
    session.deleteMany.mockResolvedValue({ count: 3 });

    await expect(revokeUserSessions("user-1")).resolves.toBe(3);
    expect(session.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });

  it("returns 0 when the user has no sessions, rather than throwing", async () => {
    session.deleteMany.mockResolvedValue({ count: 0 });

    await expect(revokeUserSessions("user-2")).resolves.toBe(0);
  });

  it("scopes the delete to the given user, never a blanket wipe", async () => {
    session.deleteMany.mockResolvedValue({ count: 1 });

    await revokeUserSessions("only-me");
    const arg = session.deleteMany.mock.calls[0][0];
    expect(arg.where).toEqual({ userId: "only-me" });
  });
});
