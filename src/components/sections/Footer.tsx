"use client";

import { Arrow, Chat, Up } from "@/components/primitives/icons";
import { SITE } from "@/lib/constants";

export function Footer(): React.ReactElement {
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
        </div>
      </div>
    </footer>
  );
}
