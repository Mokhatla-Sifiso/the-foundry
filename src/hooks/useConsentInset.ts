"use client";
import { useEffect, type RefObject } from "react";
import { CONSENT_BANNER_ID, bannerVisible, useConsent } from "@/components/privacy/ConsentProvider";

export const CONSENT_INSET_VAR = "--ug-consent-inset";
const BANNER_GAP = 24;

export function useConsentInset(stage: RefObject<HTMLElement | null>): void {
  const visible = bannerVisible(useConsent());

  useEffect(() => {
    const el = stage.current;
    const banner = visible ? document.getElementById(CONSENT_BANNER_ID) : null;
    if (!el || !banner) return;
    const apply = (): void => {
      el.style.setProperty(CONSENT_INSET_VAR, `${banner.offsetHeight + BANNER_GAP}px`);
    };
    apply();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(apply);
    observer?.observe(banner);
    return () => {
      observer?.disconnect();
      el.style.removeProperty(CONSENT_INSET_VAR);
    };
  }, [stage, visible]);
}
