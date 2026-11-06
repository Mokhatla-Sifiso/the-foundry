"use client";
import { useEffect, type RefObject } from "react";
import { CONSENT_BANNER_ID, bannerVisible, useConsent } from "@/components/privacy/ConsentProvider";

/** The custom property the gate's stage subtracts from its height. Must match gate.css. */
export const CONSENT_INSET_VAR = "--ug-consent-inset";
/** The banner sits 16px above the bottom of the screen; the stage stops 8px above it. */
const BANNER_GAP = 24;

/**
 * While the consent banner is open, gives the bottom of the stage over to it, so the scene lays
 * out in the space above and nothing sits under the banner (spec UG G6). Follows the banner's
 * height as it changes, for example when its customise panel opens.
 */
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
