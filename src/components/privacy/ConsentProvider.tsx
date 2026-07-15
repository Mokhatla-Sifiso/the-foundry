"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ACCEPT_ALL,
  CONSENT_COOKIE,
  CONSENT_COOKIE_MAX_AGE,
  DEFAULT_REJECTED,
  parseConsent,
  serializeConsent,
  type ConsentChoices,
  type ConsentRecord,
} from "@/lib/privacy/consent";
type ConsentAction = "grant" | "withdraw" | "update";
type ConsentContextValue = Readonly<{
  record: ConsentRecord | null;
  resolved: boolean;
  save: (choices: ConsentChoices, action?: ConsentAction) => Promise<void>;
  reopen: () => void;
  open: boolean;
  close: () => void;
}>;
const ConsentContext = createContext<ConsentContextValue | null>(null);
const NOOP_CONSENT: ConsentContextValue = {
  record: null,
  resolved: true,
  save: async () => {},
  reopen: () => {},
  open: false,
  close: () => {},
};
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  return ctx ?? NOOP_CONSENT;
}
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? match[1] : null;
}
function writeCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  const isSecure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie =
    `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax` + (isSecure ? "; Secure" : "");
}
const emptySubscribe = (): (() => void) => () => {};

export function ConsentProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [saved, setSaved] = useState<ConsentRecord | null>(null);
  const [open, setOpen] = useState(false);
  const rawCookie = hydrated ? readCookie(CONSENT_COOKIE) : null;
  const cookieRecord = useMemo(() => parseConsent(rawCookie), [rawCookie]);
  const record = saved ?? cookieRecord;
  const resolved = saved !== null || (hydrated && cookieRecord !== null);
  const save = useCallback(
    async (choices: ConsentChoices, action: ConsentAction = "update"): Promise<void> => {
      writeCookie(CONSENT_COOKIE, serializeConsent(choices), CONSENT_COOKIE_MAX_AGE);
      const next: ConsentRecord = {
        v: parseConsent(serializeConsent(choices))?.v ?? "",
        ts: Date.now(),
        choices,
      };
      setSaved(next);
      setOpen(false);
      try {
        await fetch("/api/privacy/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, choices }),
        });
      } catch {}
    },
    [],
  );
  const reopen = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo<ConsentContextValue>(
    () => ({ record, resolved, save, reopen, open, close }),
    [record, resolved, save, reopen, open, close],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
export { ACCEPT_ALL, DEFAULT_REJECTED };
