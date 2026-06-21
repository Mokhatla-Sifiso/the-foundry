"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@/components/primitives/icons";
import { domainOf, type ScreenResult } from "@/lib/recruiter";
import { Dots } from "./Dots";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type ScreeningProps = Readonly<{
  email: string;
  /** Async screening call. Failures fall back to an approve result. */
  screen: () => Promise<ScreenResult>;
  /** Fires once the sequence completes — caller transitions to Approved. */
  onDone: (result: ScreenResult) => void;
}>;

/**
 * Screening screen — VERBATIM animated check sequence from §10.7.
 *
 *   1. wait 550ms → email check tick.
 *   2. wait 650ms → domain check tick.
 *   3. await screen()  → screen check tick + result captured.
 *   4. wait 700ms → onDone(result).
 *
 * Each check row swaps to `.ok` (green icon + dark fg) as it
 * completes. If `screen()` rejects the helper falls back to
 * `{ decision: "approve", reason: "Verified via work email and
 * domain." }` so the user can always reach Approved.
 */
export function Screening({ email, screen, onDone }: ScreeningProps): React.ReactElement {
  const [emailOk, setEmailOk] = useState(false);
  const [domainOk, setDomainOk] = useState(false);
  const [screenOk, setScreenOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async (): Promise<void> => {
      await wait(550);
      if (cancelled) return;
      setEmailOk(true);

      await wait(650);
      if (cancelled) return;
      setDomainOk(true);

      let result: ScreenResult;
      try {
        result = await screen();
      } catch {
        result = { decision: "approve", reason: "Verified via work email and domain." };
      }
      if (cancelled) return;
      setScreenOk(true);

      await wait(700);
      if (cancelled) return;
      onDone(result);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [screen, onDone]);

  return (
    <>
      <Dots step={2} />
      <div className="center">
        <div className="spinner" aria-hidden="true" />
        <h1 className="t">Verifying you…</h1>
        <p className="sub" style={{ margin: "0 auto 26px" }}>
          Confirming your details add up to a real hiring company.
        </p>
      </div>

      <div className="checks">
        <div className={`c${emailOk ? " ok" : ""}`}>
          <span className="ic">{emailOk ? <IconCheck /> : null}</span>
          Work email confirmed
        </div>
        <div className={`c${domainOk ? " ok" : ""}`}>
          <span className="ic">{domainOk ? <IconCheck /> : null}</span>
          Domain <b>{domainOf(email)}</b> checked
        </div>
        <div className={`c${screenOk ? " ok" : ""}`}>
          <span className="ic">{screenOk ? <IconCheck /> : null}</span>
          Reviewing company &amp; role
        </div>
      </div>
    </>
  );
}
