"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useConsent } from "@/components/privacy/ConsentProvider";
import { isGranted } from "@/lib/privacy/consent";
import {
  GA_MEASUREMENT_ID,
  clearGaCookies,
  gaPageView,
  isGaConfigured,
  setGaDisabled,
} from "@/lib/analytics/ga";

type GoogleAnalyticsProps = Readonly<{ nonce?: string }>;

export function GoogleAnalytics({ nonce }: GoogleAnalyticsProps): React.ReactElement | null {
  const { record } = useConsent();
  const pathname = usePathname();
  const granted = isGaConfigured() && isGranted(record, "analytics");
  const everGranted = useRef(false);
  const firstView = useRef(true);

  useEffect(() => {
    if (granted) {
      everGranted.current = true;
      setGaDisabled(false);
      return;
    }
    if (everGranted.current) {
      everGranted.current = false;
      firstView.current = true;
      setGaDisabled(true);
      clearGaCookies();
    }
  }, [granted]);

  useEffect(() => {
    if (!granted) return;
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    gaPageView(`${pathname}${window.location.search}`);
  }, [granted, pathname]);

  if (!granted) return null;

  return (
    <>
      <Script
        id="ga-src"
        strategy="afterInteractive"
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}
