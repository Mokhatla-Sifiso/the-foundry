"use client";
import { useEffect, useRef, useState } from "react";
import { Laptop, PhoneDevice, TabletDevice, WatchDevice } from "@/components/devices";
import { Reveal } from "@/components/primitives/Reveal";
import { AIITEMS } from "@/lib/constants";
type AISectionProps = Readonly<{
  showPhone?: boolean;
  showDesktop?: boolean;
  threshold?: number;
}>;
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
      ([entry]) => setPeakActive(entry.intersectionRatio >= threshold),
      { threshold: [0, threshold / 2, threshold, threshold * 1.5, 1].filter((t) => t <= 1) },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return (
    <section ref={sectionRef} id="ai" className={`ai sec${peakActive ? " ai--peak" : ""}`}>
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
            I treat AI as everyday tooling, not a novelty — wired into the same review and
            observability loops I expect from production software.
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
