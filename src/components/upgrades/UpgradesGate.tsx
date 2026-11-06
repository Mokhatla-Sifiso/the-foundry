"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { ThemeToggle } from "@/components/primitives/ThemeToggle";
import { Arrow, Bell } from "@/components/primitives/icons";
import { useConsentInset } from "@/hooks/useConsentInset";
import { NotifyDialog } from "./NotifyDialog";
import { Tape } from "./Tape";
import "./tokens.css";
import "./buttons.css";
import "./gate.css";

export interface UpgradesGateProps {
  returnPath?: string;
}

export function UpgradesGate({ returnPath = "/" }: UpgradesGateProps): React.ReactElement {
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  useConsentInset(stage);

  return (
    <div className="ug-root">
      <div ref={stage} className="ug-stage">
        <div className="ug-glow" aria-hidden="true" />
        <div className="ug-vignette" aria-hidden="true" />
        <Tape stage={stage} ceiling={bar} avoid={actions} />
        <header ref={bar} className="ug-bar">
          <Link href="/" className="brand">
            mzwakhe<span className="d">.</span>
          </Link>
          <ThemeToggle />
        </header>
        <main>
          <h1 className="sr-only">Upgrades in progress</h1>
          <div ref={actions} className="ug-actions">
            <form method="post" action="/api/site-access">
              <input type="hidden" name="return" value={returnPath} />
              <button type="submit" className="ug-btn ug-btn--primary">
                <span className="ug-btn__label">Go to previous portfolio version for now</span>
                <span className="ug-btn__ic">
                  <Arrow />
                </span>
              </button>
            </form>
            <button
              type="button"
              className="ug-btn ug-btn--secondary"
              aria-haspopup="dialog"
              onClick={() => setNotifyOpen(true)}
            >
              <span className="ug-btn__label">Notify me when the updates are done</span>
              <span className="ug-btn__ic">
                <Bell />
              </span>
            </button>
          </div>
        </main>
      </div>
      <NotifyDialog open={notifyOpen} onClose={() => setNotifyOpen(false)} />
    </div>
  );
}
