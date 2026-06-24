import { COOKIE_POLICY_VERSION } from "./policy";
import type { CookieCategory } from "./cookies";
export const CONSENT_COOKIE = "consent";
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export type ConsentChoices = Readonly<{
  necessary: true;
  functional: boolean;
  analytics: boolean;
}>;
export type ConsentRecord = Readonly<{
  v: string;
  ts: number;
  choices: ConsentChoices;
}>;
export const DEFAULT_REJECTED: ConsentChoices = {
  necessary: true,
  functional: false,
  analytics: false,
};
export const ACCEPT_ALL: ConsentChoices = {
  necessary: true,
  functional: true,
  analytics: true,
};
export function parseConsent(raw: string | undefined | null): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentRecord>;
    if (parsed.v !== COOKIE_POLICY_VERSION) return null;
    if (typeof parsed.ts !== "number") return null;
    const c = parsed.choices;
    if (!c || typeof c !== "object") return null;
    return {
      v: parsed.v,
      ts: parsed.ts,
      choices: {
        necessary: true,
        functional: Boolean(c.functional),
        analytics: Boolean(c.analytics),
      },
    };
  } catch {
    return null;
  }
}
export function serializeConsent(choices: ConsentChoices): string {
  const record: ConsentRecord = {
    v: COOKIE_POLICY_VERSION,
    ts: Date.now(),
    choices,
  };
  return encodeURIComponent(JSON.stringify(record));
}
export function isGranted(record: ConsentRecord | null, category: CookieCategory): boolean {
  if (category === "necessary") return true;
  if (!record) return false;
  return record.choices[category] === true;
}
