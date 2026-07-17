/**
 * A time-boxed escape from the recruiter work-email check, so the journey can be
 * walked with a personal address.
 *
 * Deliberately separate from the admin allowlist. Allowlisting yourself also
 * grants admin, and `cvGrantFor` short-circuits on admin — which hands you the CV
 * before any gate runs and makes the thing you wanted to test untestable.
 *
 * It grants nothing else, and it expires on a wall-clock deadline rather than a
 * flag, so a forgotten env var stops working by itself instead of quietly
 * becoming a permanent hole in the only check the recruiter tier has.
 */
export function recruiterBypassAllows(email: string, now: Date = new Date()): boolean {
  const until = process.env.RECRUITER_BYPASS_UNTIL;
  if (!until) return false;

  const deadline = Date.parse(until);
  if (Number.isNaN(deadline) || now.getTime() >= deadline) return false;

  const target = email.trim().toLowerCase();
  if (!target) return false;

  return (process.env.RECRUITER_BYPASS_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(target);
}
