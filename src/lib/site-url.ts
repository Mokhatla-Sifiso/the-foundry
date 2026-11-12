export const PRODUCTION_SITE_URL = "https://www.mzwakhemokhatla.co.za";

export const SITE_URL: string = (() => {
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_SITE_URL;

  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
})();
