"use client";
import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";
import { useConsent } from "@/components/privacy/ConsentProvider";
import { isGranted } from "@/lib/privacy/consent";

export function SpeedInsights(): React.ReactElement | null {
  const { record } = useConsent();
  if (!isGranted(record, "analytics")) return null;
  return <VercelSpeedInsights />;
}
