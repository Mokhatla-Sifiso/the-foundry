"use client";

import { motion } from "framer-motion";
import { Reveal, EASE } from "@/components/primitives/Reveal";
import { WORK } from "@/lib/constants";

/**
 * Work — VERBATIM markup + copy from §7.6.
 *
 * 2-up grid, 4 cards. Left column delay 0, right column delay 0.08
 * (`(i % 2) * 0.08`). Hover lift: `y: -6` over .4s with EASE.
 *
 * The image slot is a placeholder until /img/work-*.jpg assets land
 * per §14 — then swap for `next/image` with the matching `slot` key.
 */
export function Work(): React.ReactElement {
  return (
    <section id="work" className="sec">
      <div className="wrap">
        <div className="work-head">
          <Reveal>
            <h2>
              A track record of turning ideas into{" "}
              <span style={{ color: "var(--candy)" }}>digital realities.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p>
              Selected projects across telecom, consulting, fintech, and GIS —
              built and shipped end to end.
            </p>
          </Reveal>
        </div>

        <div className="work-grid">
          {WORK.map((w, i) => (
            <Reveal key={w.slot} delay={(i % 2) * 0.08}>
              <motion.div
                className="work-card"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="image-slot" aria-hidden="true" data-slot={w.slot} />
                <div className="ov">
                  <span className="tag">{w.tag}</span>
                  <div className="nm">{w.nm}</div>
                  <div className="og">{w.og}</div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
