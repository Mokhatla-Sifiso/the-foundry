"use client";
import { useEffect, useRef, useState } from "react";
import { Laptop, PhoneDevice, TabletDevice, WatchDevice } from "@/components/devices";
import { Reveal } from "@/components/primitives/Reveal";
import { AIToolkit } from "./AIToolkit";
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
          In the workflow
        </Reveal>
        <Reveal>
          <h2 className="ai-h">
            My stack got faster. <span className="em">My judgment stayed mine.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="ai-lead">
            Agents live in my terminal and editor now, handling scaffolding, migrations, tests and
            first drafts across the whole stack. I still own the architecture, the review, and the
            call on what ships. The difference is I get there in hours, not days.
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
        </div>

        <Reveal delay={0.05}>
          <AIToolkit />
        </Reveal>
      </div>
    </section>
  );
}
