"use client";

import Link from "next/link";
import { Arrow, Chat, Up } from "@/components/primitives/icons";
import { SITE } from "@/lib/constants";
import { useConsent } from "@/components/privacy/ConsentProvider";

/**
 * Footer — VERBATIM markup + copy from §7.10. Big wordmark + sub,
 * links row, GoUp button. Client component because the GoUp handler
 * uses `window.scrollTo`.
 */
export function Footer(): React.ReactElement {
  const { reopen } = useConsent();
  const goUp = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-card">
          <div className="foot-big">
            Mzwakhe Mokhatla<span className="d">.</span>
          </div>
          <div className="foot-sub">
            Software Engineer · Full-Stack · Tech Lead — {SITE.location}
          </div>

          <div className="foot-bar">
            <div className="links">
              <a href={`mailto:${SITE.email}`}>
                Email
                <span className="ic">
                  <Chat />
                </span>
              </a>
              <a href={SITE.phoneHref}>
                Phone
                <span className="ic">
                  <Arrow />
                </span>
              </a>
              <a href="#work">
                Work
                <span className="ic">
                  <Arrow />
                </span>
              </a>
            </div>
            <button
              type="button"
              className="goup"
              onClick={goUp}
              aria-label="Scroll back to top"
            >
              Go up
              <span className="ic">
                <Up />
              </span>
            </button>
          </div>

          <div className="foot-legal">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/terms">Terms</Link>
            <button type="button" className="foot-legal-btn" onClick={reopen}>
              Cookie preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
