"use client";
import Link from "next/link";
import { useRef } from "react";
import { Arrow, Bell, Close, IconAlert, IconCheck, IconMail } from "@/components/primitives/icons";
import { useConsentInset } from "@/hooks/useConsentInset";
import { PAGE_PRESETS } from "@/lib/tape/geometry";
import type { StatusAction, StatusView } from "@/lib/updates/pages";
import { Tape } from "./Tape";
import { TopBar } from "./TopBar";
import "./tokens.css";
import "./buttons.css";
import "./form.css";
import "./gate.css";
import "./status.css";

const ICONS = {
  mail: IconMail,
  check: IconCheck,
  alert: IconAlert,
  close: Close,
  arrow: Arrow,
  bell: Bell,
} as const;
const NONE = [] as const;

function Action({ action }: { action: StatusAction }): React.ReactElement {
  const Icon = ICONS[action.icon];
  const content = (
    <>
      <span className="ug-btn__label">{action.label}</span>
      <span className="ug-btn__ic">
        <Icon />
      </span>
    </>
  );
  if (action.kind === "form") {
    return (
      <form method="post" action={action.endpoint}>
        <input type="hidden" name="token" value={action.token} />
        <button type="submit" className="ug-btn ug-btn--primary">
          {content}
        </button>
      </form>
    );
  }
  return (
    <Link
      href={action.href}
      prefetch={false}
      className={action.primary ? "ug-btn ug-btn--primary" : "ug-btn ug-btn--secondary"}
    >
      {content}
    </Link>
  );
}

export function StatusPage({ view }: { view: StatusView }): React.ReactElement {
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  useConsentInset(stage);
  const Mark = ICONS[view.icon];

  return (
    <div className="ug-root">
      <div ref={stage} className="ug-stage">
        <div className="ug-glow" aria-hidden="true" />
        <Tape stage={stage} ceiling={bar} avoid={NONE} presets={PAGE_PRESETS} />
        <TopBar ref={bar} />
        <main className="ug-page">
          <div className="ug-page__card">
            <span className={view.muted ? "ug-status ug-status--muted" : "ug-status"}>
              <Mark />
            </span>
            <h1>{view.title}</h1>
            <p>{view.body}</p>
            {view.alert ? (
              <div className="ug-alert" role="alert">
                <IconAlert />
                <span>{view.alert}</span>
              </div>
            ) : null}
            <div className="ug-page__actions">
              <Action action={view.action} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
