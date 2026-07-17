"use client";
import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";
import { useConsent } from "@/components/privacy/ConsentProvider";
import { isGranted } from "@/lib/privacy/consent";

/**
 * Vercel Speed Insights, gated behind the same analytics consent as GA. It is
 * cookieless, so withdrawal needs no cookie cleanup: not rendering it means the
 * script never injects, and unmounting removes the tag it added. The script is
 * created via document.createElement from the trusted bundle, so the CSP's
 * 'strict-dynamic' propagates trust to it without needing a nonce, and its beacon
 * is same-origin (/_vercel/speed-insights/vitals), already covered by 'self'.
 */
export function SpeedInsights(): React.ReactElement | null {
  const { record } = useConsent();
  if (!isGranted(record, "analytics")) return null;
  return <VercelSpeedInsights />;
}
