/**
 * Single source of truth for the canonical site URL.
 *
 * Priority order:
 *   1. NEXT_PUBLIC_SITE_URL  — set this explicitly when a custom domain
 *      is wired up (e.g. https://mzwakhe.dev).
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel injects this on prod builds
 *      so the site stays correct before a custom domain is attached.
 *   3. VERCEL_URL — preview deployments.
 *   4. Hardcoded fallback for local dev.
 *
 * Always returned without a trailing slash so callers can safely append paths.
 */
export const SITE_URL: string = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
})();
