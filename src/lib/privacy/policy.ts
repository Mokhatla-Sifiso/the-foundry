/**
 * Single source of truth for the privacy / cookie policy versions.
 * Bump these whenever you ship a material change. The UI uses the version
 * string to decide when to re-prompt users for consent.
 */
export const PRIVACY_POLICY_VERSION = "2026-06-23.v1";
export const COOKIE_POLICY_VERSION = "2026-06-23.v1";
export const TERMS_VERSION = "2026-06-23.v1";

export const DATA_CONTROLLER = {
  name: "Mzwakhe Mokhatla",
  email: "mokhatla.mzwakhe@gmail.com",
  location: "South Africa",
} as const;

export const DATA_RETENTION_DAYS = 365;
