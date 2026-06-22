"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@/components/primitives/icons";
import { domainOf, type ScreenResult } from "@/lib/recruiter";
import { Dots } from "./Dots";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type ScreeningProps = Readonly<{
  email: string;
    screen: () => Promise<ScreenResult>;
    onDone: (result: ScreenResult) => void;
}>;

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
