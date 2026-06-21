"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionStyle } from "framer-motion";
import { Laptop, PhoneDevice, TabletDevice, WatchDevice } from "@/components/devices";
import { Reveal } from "@/components/primitives/Reveal";
import { useTheme } from "@/hooks/useTheme";
import { _hx, _lum, _rgb, _rgba } from "@/lib/colors";
import { AIITEMS, PEAK_COLOR } from "@/lib/constants";

type AISectionProps = Readonly<{
  /** Override the peak background color (Tweaks panel hook, §12). */
  peakColor?: string;
  /** Toggle phone visibility (Tweaks panel hook). */
  showPhone?: boolean;
  /** Toggle tablet visibility (Tweaks panel hook). */
  showDesktop?: boolean;
}>;

/**
 * AI section — scroll-driven background transition (§7.8 with one
 * deviation).
 *
 * The 5 `useTransform` mappings (bg / fg / mut / bdr / acc) all use
 * the shape `[0, 0.5, 1] → [edge, peak, edge]` — the section colors
 * transition in as you scroll into view, peak at the middle, then
 * return to the page edge tone as you scroll past. The spec's
 * original `[edge, peak, peak]` latch was kept "stuck on peak" once
 * triggered, which read as awkward when scrolling continued forward
 * — replaced with this smooth in-and-out per user feedback.
 *
 * In dark theme a near-black peak swaps to candy so it stays visible
 * against the onyx page background.
 */
export function AISection({
  peakColor = PEAK_COLOR,
  showPhone = true,
  showDesktop = true,
}: AISectionProps = {}): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const { theme } = useTheme();
  const L = theme !== "dark";

  const edgeBg = L ? "#e9f1f5" : "#020202";
  const edgeTx = L ? [6, 9, 11] : [238, 245, 248];

  // Auto-swap a near-black peak to candy in dark theme so it stays visible.
  let peak = peakColor || "#020202";
  if (!L && _lum(_hx(peak)) < 0.12) peak = "#B2D5E5";
  const peakRGB = _hx(peak);
  const peakTx = _lum(peakRGB) < 0.55 ? [238, 245, 248] : [6, 24, 31];
  const accEdge = L ? "#2a6f93" : "#B2D5E5";
  const accPeak = _lum(peakRGB) < 0.55 ? "#B2D5E5" : "#06181f";

  const stops = [0, 0.5, 1];
  const bg = useTransform(scrollYProgress, stops, [edgeBg, peak, edgeBg]);
  const fg = useTransform(
    scrollYProgress,
    stops,
    [_rgb(edgeTx), _rgb(peakTx), _rgb(edgeTx)],
  );
  const mut = useTransform(
    scrollYProgress,
    stops,
    [_rgba(edgeTx, 0.62), _rgba(peakTx, 0.74), _rgba(edgeTx, 0.62)],
  );
  const bdr = useTransform(
    scrollYProgress,
    stops,
    [_rgba(edgeTx, 0.14), _rgba(peakTx, 0.22), _rgba(edgeTx, 0.14)],
  );
  const acc = useTransform(scrollYProgress, stops, [accEdge, accPeak, accEdge]);

  const sectionStyle: MotionStyle = { backgroundColor: bg, color: fg };
  const mutStyle: MotionStyle = { color: mut };

  return (
    <motion.section
      id="ai"
      ref={ref}
      className="ai sec"
      style={sectionStyle}
    >
      <div className="wrap">
        <Reveal as="span" className="eyebrow" style={mutStyle as React.CSSProperties}>
          AI in the workflow
        </Reveal>
        <Reveal>
          <h2 className="ai-h">
            AI is part of{" "}
            <motion.span style={{ color: acc }}>how I build.</motion.span>
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <motion.p className="ai-lead" style={mutStyle}>
            I treat AI as everyday tooling, not a novelty — wired into the
            same review and observability loops I expect from production
            software.
          </motion.p>
        </Reveal>

        <div className="ai-showcase">
          <div className="bg-fade" />

          <Reveal className="laptop">
            <Laptop />
          </Reveal>

          {showPhone ? (
            <Reveal className="phone" delay={0.1}>
              <PhoneDevice />
            </Reveal>
          ) : null}

          <Reveal className="watch" delay={0.15}>
            <WatchDevice />
          </Reveal>

          {showDesktop ? (
            <Reveal className="tablet" delay={0.12}>
              <TabletDevice />
            </Reveal>
          ) : null}

          <span className="dev-label" style={{ top: -8, left: 56 }}>
            AI Briefings
          </span>
          <span className="dev-label" style={{ bottom: 22, left: -28 }}>
            On your wrist
          </span>
          <span className="dev-label" style={{ bottom: -2, right: -14 }}>
            Full reporting
          </span>
        </div>

        <div className="ai-grid">
          {AIITEMS.map((item, i) => (
            <Reveal key={item.t} delay={(i % 2) * 0.06} style={{ height: "100%" }}>
              <motion.div className="ai-item" style={{ borderColor: bdr }}>
                <motion.div className="ai-n" style={{ color: acc }}>
                  {String(i + 1).padStart(2, "0")}
                </motion.div>
                <h3>{item.t}</h3>
                <motion.p style={mutStyle}>{item.d}</motion.p>
                <div className="ai-tools">
                  {item.tools.map((tool) => (
                    <motion.span key={tool} style={{ borderColor: bdr }}>
                      {tool}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
