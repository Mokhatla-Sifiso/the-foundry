"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useConsent, ACCEPT_ALL, DEFAULT_REJECTED } from "./ConsentProvider";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  inventoryByCategory,
  type CookieCategory,
} from "@/lib/privacy/cookies";
import type { ConsentChoices } from "@/lib/privacy/consent";
import "./consent.css";

export function ConsentBanner(): React.ReactElement | null {
  const { record, resolved, save, open, close } = useConsent();
  const [customising, setCustomising] = useState(false);
  const [draft, setDraft] = useState<ConsentChoices>(() => record?.choices ?? DEFAULT_REJECTED);

  const visible = (!resolved) || open;

  const openCustomise = (): void => {
    setDraft(record?.choices ?? DEFAULT_REJECTED);
    setCustomising(true);
  };

  const dismiss = (): void => {
    setCustomising(false);
    close();
  };

  const toggle = (cat: CookieCategory): void => {
    if (CATEGORY_META[cat].alwaysOn) return;
    setDraft((d) => ({ ...d, [cat]: !d[cat as Exclude<CookieCategory, "necessary">] }));
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          className="consent"
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="consent-inner">
            {!customising ? (
              <>
                <div className="consent-copy">
                  <h2 id="consent-title">Your privacy</h2>
                  <p>
                    I use cookies to keep you signed in to <strong>/recruiter</strong> and
                    remember your preferences. Read the{" "}
                    <Link href="/legal/cookies">Cookie Policy</Link> and{" "}
                    <Link href="/legal/privacy">Privacy Policy</Link> for details. You can
                    change your mind anytime.
                  </p>
                </div>
                <div className="consent-actions">
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={() => void save(DEFAULT_REJECTED, "withdraw")}
                  >
                    Reject non-essential
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={openCustomise}
                  >
                    Customise
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-primary"
                    onClick={() => void save(ACCEPT_ALL, "grant")}
                  >
                    Accept all
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="consent-copy">
                  <h2 id="consent-title">Customise cookies</h2>
                  <p>
                    Choose which categories you allow. Strictly necessary cookies can&apos;t
                    be turned off because the site needs them to function.
                  </p>
                </div>
                <ul className="consent-list">
                  {CATEGORY_ORDER.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const checked = cat === "necessary" ? true : draft[cat as "functional" | "analytics"];
                    const items = inventoryByCategory(cat);
                    return (
                      <li key={cat} className="consent-row">
                        <div className="consent-row-head">
                          <label className="consent-toggle">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={meta.alwaysOn}
                              onChange={() => toggle(cat)}
                              aria-label={`Toggle ${meta.label} cookies`}
                            />
                            <span className="consent-toggle-knob" aria-hidden="true" />
                          </label>
                          <div>
                            <strong>{meta.label}</strong>
                            {meta.alwaysOn ? <span className="consent-pill">Always on</span> : null}
                            <p>{meta.description}</p>
                          </div>
                        </div>
                        {items.length > 0 ? (
                          <details className="consent-details">
                            <summary>
                              {items.length} {items.length === 1 ? "item" : "items"} in this
                              category
                            </summary>
                            <ul>
                              {items.map((c) => (
                                <li key={c.name}>
                                  <code>{c.name}</code>
                                  <span>· {c.purpose}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <div className="consent-actions">
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={() => setCustomising(false)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-ghost"
                    onClick={dismiss}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="consent-btn consent-btn-primary"
                    onClick={() => {
                      void save(draft, "update");
                      setCustomising(false);
                    }}
                  >
                    Save preferences
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
