import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionContext } from "@/lib/auth/admin";
import {
  COOKIE_POLICY_VERSION,
  PRIVACY_POLICY_VERSION,
  TERMS_VERSION,
} from "@/lib/privacy/policy";

/**
 * GDPR Article 15 (right of access) + Article 20 (data portability). Returns a
 * structured JSON snapshot of every record we hold about the authenticated
 * user, suitable for download. Sets Content-Disposition so browsers offer it as
 * a file.
 */
export async function GET(): Promise<Response> {
  try {
    const ctx = await getSessionContext();
    if (!ctx) {
      return NextResponse.json({ message: "Sign in required." }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      include: {
        recruiterProfile: true,
        sessions: { select: { id: true, ipAddress: true, userAgent: true, createdAt: true } },
        consentLogs: {
          select: { action: true, payload: true, policyVer: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }

    const snapshot = {
      exportedAt: new Date().toISOString(),
      policyVersions: {
        privacy: PRIVACY_POLICY_VERSION,
        cookies: COOKIE_POLICY_VERSION,
        terms: TERMS_VERSION,
      },
      identity: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      consent: {
        termsAcceptedAt: user.acceptedTermsAt,
        privacyAcceptedAt: user.acceptedPrivacyAt,
        termsVersion: user.acceptedTermsVer,
        privacyVersion: user.acceptedPrivacyVer,
        log: user.consentLogs,
      },
      profile: user.recruiterProfile,
      sessions: user.sessions,
    };

    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="my-data-${user.id}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[recruiter/data]", err);
    return NextResponse.json({ message: "Could not export data." }, { status: 500 });
  }
}
