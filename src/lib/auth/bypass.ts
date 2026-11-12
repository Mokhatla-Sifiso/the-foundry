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
