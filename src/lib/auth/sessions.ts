import { db } from "@/lib/db";

/**
 * Revoke every session for a user by deleting its rows. With cookieCache
 * disabled, each request re-validates against the database, so this takes effect
 * on the user's next request rather than lingering behind a cached cookie.
 *
 * This is the server-side primitive behind both self-service "sign out
 * everywhere" and an owner booting a specific account. Returns the number of
 * sessions killed.
 */
export async function revokeUserSessions(userId: string): Promise<number> {
  const { count } = await db.session.deleteMany({ where: { userId } });
  return count;
}
