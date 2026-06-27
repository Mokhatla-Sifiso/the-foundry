"use client";
import { motion } from "framer-motion";
import { Reveal, EASE } from "@/components/primitives/Reveal";
import { LogoBar } from "@/components/sections/LogoBar";
import { WorkVisual } from "@/components/sections/WorkVisual";
import { WORK } from "@/lib/constants";
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
              Selected projects across telecom, consulting, fintech, and GIS — built and shipped end
              to end.
            </p>
          </Reveal>
        </div>

        <LogoBar />

        <div className="work-grid">
          {WORK.map((w, i) => (
            <Reveal key={w.slot} delay={(i % 2) * 0.08}>
              <motion.div
                className="work-card"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="image-slot" aria-hidden="true" data-slot={w.slot}>
                  <WorkVisual slot={w.slot} />
                </div>
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
