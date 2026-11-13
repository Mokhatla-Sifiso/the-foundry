import { db } from "@/lib/db";

export async function revokeUserSessions(userId: string): Promise<number> {
  const { count } = await db.session.deleteMany({ where: { userId } });
  return count;
}
