"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  siDocker,
  siGithubactions,
  siGrafana,
  siKubernetes,
  siNestjs,
  siNextdotjs,
  siOllama,
  siOpentelemetry,
  siPostgresql,
  siPrometheus,
  siPulumi,
  siReact,
  siRedis,
} from "simple-icons";
import { Reveal } from "@/components/primitives/Reveal";

type Logo = Readonly<{ name: string; path?: string; short?: string }>;

const CLIENT: ReadonlyArray<Logo> = [
  { name: "Next.js", path: siNextdotjs.path },
  { name: "React", path: siReact.path },
];
const BACKEND: ReadonlyArray<Logo> = [
  { name: "PostgreSQL", path: siPostgresql.path },
  { name: "Redis", path: siRedis.path },
];
// tool chips orbiting the hub — the stack inside the app
const ORBIT: ReadonlyArray<Logo> = [
  { name: "NestJS", path: siNestjs.path },
  { name: "Ollama", path: siOllama.path },
  { name: "LiteLLM", short: "LL" },
  { name: "Langfuse", short: "Lf" },
  { name: "Azure", short: "AZ" },
  { name: "Module Federation", short: "MF" },
];
const FOUNDATION: ReadonlyArray<Logo> = [
  { name: "Docker", path: siDocker.path },
  { name: "Kubernetes", path: siKubernetes.path },
  { name: "Pulumi", path: siPulumi.path },
  { name: "GitHub Actions", path: siGithubactions.path },
  { name: "Grafana", path: siGrafana.path },
  { name: "Prometheus", path: siPrometheus.path },
  { name: "OpenTelemetry", path: siOpentelemetry.path },
];

function Mark({ logo, className }: { logo: Logo; className?: string }): React.ReactElement {
  if (logo.path) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={`arch-mark${className ? ` ${className}` : ""}`}
        role="img"
        aria-label={logo.name}
      >
        <title>{logo.name}</title>
        <path d={logo.path} fill="currentColor" />
      </svg>
    );
  }
  return (
    <span
      className={`arch-mark arch-mark--mono${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={logo.name}
      title={logo.name}
    >
      {logo.short}
    </span>
  );
}

export function ArchitecturePatterns(): React.ReactElement {
  const [live, setLive] = useState(false);
  const timer = useRef<number | null>(null);

  const clear = useCallback((): void => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => clear, [clear]);

  const trace = useCallback((): void => {
    clear();
    setLive(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = window.setTimeout(() => setLive(false), 2600);
  }, [clear]);

  return (
    <section id="architecture" className="sec arch">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Architectures &amp; Patterns
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="arch-h">
            How I architect <span className="em">what I ship.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="arch-lead">
            The stack behind an AI-native product. A request flows in from the browser and streams
            back out to your systems.
          </p>
        </Reveal>

        <Reveal delay={0.14} className="arch-stage">
          <div className={`arch-diagram${live ? " is-live" : ""}`}>
            {/* left flank */}
            <div className="arch-flank">
              <span className="arch-flank-label">User&apos;s Browser</span>
              <div className="arch-flank-card">
                {CLIENT.map((l) => (
                  <Mark key={l.name} logo={l} />
                ))}
              </div>
            </div>

            {/* connector in */}
            <div className="arch-wire arch-wire--in">
              <span className="arch-tag">REQUEST</span>
              <span className="arch-wire-track">
                <span className="arch-wire-dot" />
              </span>
            </div>

            {/* the hub */}
            <div className="arch-hub">
              <span className="arch-hub-tag">AI-NATIVE STACK</span>
              <div className="arch-hub-halo">
                <div className="arch-hub-core">
                  <svg viewBox="0 0 48 48" className="arch-hub-glyph" aria-hidden="true">
                    <circle cx="24" cy="24" r="20" className="arch-hub-ring" />
                    <circle cx="24" cy="24" r="13" className="arch-hub-ring" />
                    <circle cx="24" cy="24" r="6" className="arch-hub-ring" />
                    <path d="M24 4v40M4 24h40M9 9l30 30M39 9L9 39" className="arch-hub-grid" />
                  </svg>
                </div>
                <ul className="arch-orbit" aria-label="Stack inside the app">
                  {ORBIT.map((l) => (
                    <li key={l.name} className="arch-orbit-chip">
                      <Mark logo={l} />
                    </li>
                  ))}
                </ul>
              </div>
              <span className="arch-hub-pill">Your App</span>
            </div>

            {/* connector out */}
            <div className="arch-wire arch-wire--out">
              <span className="arch-tag">JSON STREAM</span>
              <span className="arch-wire-track">
                <span className="arch-wire-dot" />
              </span>
            </div>

            {/* right flank */}
            <div className="arch-flank">
              <span className="arch-flank-label">Your Backend</span>
              <div className="arch-flank-card">
                {BACKEND.map((l) => (
                  <Mark key={l.name} logo={l} />
                ))}
              </div>
            </div>
          </div>

          <div className="arch-controls">
            <button type="button" className="btn btn-primary arch-trace" onClick={trace}>
              Trace a request
            </button>
            <div className="arch-foundation" aria-label="Cross-cutting tooling">
              <span className="arch-foundation-label">Runs on</span>
              <div className="arch-foundation-marks">
                {FOUNDATION.map((l) => (
                  <span className="arch-fmark" key={l.name}>
                    <Mark logo={l} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
