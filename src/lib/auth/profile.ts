import { db } from "@/lib/db";

export type RecruiterDecision = "pending" | "approve" | "reject";

export type RecruiterAccountDto = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  verifiedAt: number;
  isAdmin: boolean;
  screen: {
    decision: RecruiterDecision;
    reason: string;
  } | null;
}>;

export async function fetchAccount(userId: string): Promise<RecruiterAccountDto | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { recruiterProfile: true },
  });
  if (!user) return null;
  const admin = await db.adminWhitelist.findUnique({ where: { email: user.email } });
  const profile = user.recruiterProfile;
  return {
    name: user.name,
    email: user.email,
    company: profile?.company ?? "",
    role: profile?.role ?? (admin ? "Admin" : ""),
    url: profile?.url ?? "",
    verifiedAt: (profile?.verifiedAt ?? user.createdAt).getTime(),
    isAdmin: admin !== null,
    screen: profile
      ? { decision: profile.decision, reason: profile.reason ?? "" }
      : admin
        ? { decision: "approve", reason: "Admin allowlist." }
        : null,
  };
}
