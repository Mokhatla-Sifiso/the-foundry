"use client";

import { useEffect, useRef, useState } from "react";
import { Laptop, PhoneDevice, TabletDevice, WatchDevice } from "@/components/devices";
import { Reveal } from "@/components/primitives/Reveal";
import { AIITEMS } from "@/lib/constants";

type AISectionProps = Readonly<{
  /** Toggle phone visibility (Tweaks panel hook). */
  showPhone?: boolean;
  /** Toggle tablet visibility (Tweaks panel hook). */
  showDesktop?: boolean;
  /** Fraction of the section's height that must be in view before the
   *  peak palette kicks in. 0.25 means the section flips when ~a quarter
   *  of it is visible — tuned to feel natural on a typical scroll. */
  threshold?: number;
}>;

/**
 * AI section — discrete in-view trigger drives a palette swap.
 *
 * Earlier iterations interpolated colors continuously via `useScroll +
 * useTransform` over the entire scroll range. That made the section's
 * background drift with every scroll tick and felt "stuck on dark"
 * once you crossed midway — the spec's original "latch" behaviour.
 *
 * The new model (per the Medium article the user pointed to): use an
 * `IntersectionObserver` to detect when the section enters/leaves the
 * viewport, toggle the `ai--peak` class on the element, and let CSS
 * variables + a transition handle the visual swap. Discrete trigger,
 * smooth visual via `transition: background-color/color/border-color
 * .8s var(--ease)` defined in globals.css. No JS animation loop, no
 * per-frame work.
 */
export function AISection({
  showPhone = true,
  showDesktop = true,
  threshold = 0.25,
}: AISectionProps = {}): React.ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const [peakActive, setPeakActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setPeakActive(entry.isIntersecting),
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <section
      ref={sectionRef}
      id="ai"
      className={`ai sec${peakActive ? " ai--peak" : ""}`}
    >
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          AI in the workflow
        </Reveal>
        <Reveal>
          <h2 className="ai-h">
            AI is part of <span className="em">how I build.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="ai-lead">
            I treat AI as everyday tooling, not a novelty — wired into the
            same review and observability loops I expect from production
            software.
          </p>
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
              <div className="ai-item">
                <div className="ai-n">{String(i + 1).padStart(2, "0")}</div>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
                <div className="ai-tools">
                  {item.tools.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
