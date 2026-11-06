"use client";
import { useMemo, useRef, useState } from "react";
import { Arrow, Bell } from "@/components/primitives/icons";
import { useConsentInset } from "@/hooks/useConsentInset";
import { LaunchDate } from "./LaunchDate";
import { NotifyDialog } from "./NotifyDialog";
import { Tape } from "./Tape";
import { TopBar } from "./TopBar";
import "./tokens.css";
import "./buttons.css";
import "./gate.css";

export interface UpgradesGateProps {
  /** Where "Go to previous portfolio version for now" returns the visitor (FR-UG-02). */
  returnPath?: string;
}

/**
 * The upgrades gate (spec UG FR-UG-04): the brand and theme toggle, three tape strips, the
 * page's only two actions and the launch date. The heading is visually hidden; the tape is
 * decoration.
 */
export function UpgradesGate({ returnPath = "/" }: UpgradesGateProps): React.ReactElement {
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const date = useRef<HTMLParagraphElement>(null);
  const avoid = useMemo(() => [actions, date], [actions, date]);
  const [notifyOpen, setNotifyOpen] = useState(false);
  useConsentInset(stage);

  return (
    <div className="ug-root">
      <div ref={stage} className="ug-stage">
        <div className="ug-glow" aria-hidden="true" />
        <div className="ug-vignette" aria-hidden="true" />
        <Tape stage={stage} ceiling={bar} avoid={avoid} />
        <TopBar ref={bar} />
        <main>
          <h1 className="sr-only">Upgrades in progress</h1>
          <div className="ug-footer">
            <div ref={actions} className="ug-actions">
              {/* A plain form POST, so the way through works without JavaScript (FR-UG-02). */}
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
            <LaunchDate ref={date} />
          </div>
        </main>
      </div>
      <NotifyDialog open={notifyOpen} onClose={() => setNotifyOpen(false)} />
    </div>
  );
}
