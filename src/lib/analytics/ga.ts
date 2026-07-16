export const GA_MEASUREMENT_ID: string = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isValidGaId(id: string): boolean {
  return /^G-[A-Z0-9]{4,}$/i.test(id);
}

export function isGaConfigured(): boolean {
  return isValidGaId(GA_MEASUREMENT_ID);
}

export function gaPageView(path: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function setGaDisabled(disabled: boolean, id: string = GA_MEASUREMENT_ID): void {
  if (typeof window === "undefined" || !id) return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${id}`] = disabled;
}

export function clearGaCookies(): void {
  if (typeof document === "undefined") return;
  const names = document.cookie
    .split("; ")
    .map((entry) => entry.split("=")[0])
    .filter((name) => name === "_ga" || name === "_gid" || name.startsWith("_ga_"));
  const host = typeof location !== "undefined" ? location.hostname : "";
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    if (host) {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${host}`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${host}`;
    }
  }
}
