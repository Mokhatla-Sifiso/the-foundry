/**
 * Recruiter-flow helpers — VERBATIM from §10.1 of the build spec.
 * The localStorage keys and the FREE-domain set are part of the
 * contract; don't rename or add domains without spec update.
 */

export const LS_ACCOUNTS = "recruiter-accounts-v1";
export const LS_SESSION = "recruiter-session-v1";

export const FREE: ReadonlySet<string> = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "zoho.com",
  "pm.me",
  "hey.com",
  "ymail.com",
]);

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const domainOf = (e: string): string =>
  (e.split("@")[1] || "").toLowerCase().trim();

export const isFree = (e: string): boolean => FREE.has(domainOf(e));

/** 6-digit numeric OTP. */
export const genCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export type RecruiterAccount = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  verifiedAt: number;
  screen?: ScreenResult;
}>;

export type ScreenResult = Readonly<{
  decision: "approve" | "review";
  reason: string;
}>;

type AccountMap = Record<string, RecruiterAccount>;

export const loadAccounts = (): AccountMap => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_ACCOUNTS) || "{}") as AccountMap;
  } catch {
    return {};
  }
};

export const saveAccounts = (accounts: AccountMap): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ACCOUNTS, JSON.stringify(accounts));
};
