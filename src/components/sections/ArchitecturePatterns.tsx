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
type FlowNode = Readonly<{ id: string; label: string; role: string; logos: ReadonlyArray<Logo> }>;

const NODES: ReadonlyArray<FlowNode> = [
  {
    id: "client",
    label: "Client",
    role: "Interface",
    logos: [
      { name: "Next.js", path: siNextdotjs.path },
      { name: "React", path: siReact.path },
    ],
  },
  {
    id: "edge",
    label: "Edge",
    role: "Front door",
    logos: [{ name: "Azure Front Door", short: "AZ" }],
  },
  {
    id: "shell",
    label: "Shell",
    role: "Micro-frontend",
    logos: [{ name: "Module Federation", short: "MF" }],
  },
  {
    id: "bff",
    label: "BFF",
    role: "Backend-for-frontend",
    logos: [{ name: "NestJS", path: siNestjs.path }],
  },
  {
    id: "gateway",
    label: "Gateway",
    role: "API management",
    logos: [{ name: "Azure APIM", short: "AZ" }],
  },
  {
    id: "ai",
    label: "AI orchestration",
    role: "Retrieval + generation",
    logos: [
      { name: "Ollama", path: siOllama.path },
      { name: "LiteLLM", short: "LL" },
      { name: "Langfuse", short: "Lf" },
    ],
  },
  {
    id: "data",
    label: "Data",
    role: "State + memory",
    logos: [
      { name: "PostgreSQL · pgvector", path: siPostgresql.path },
      { name: "Redis", path: siRedis.path },
    ],
  },
  {
    id: "workers",
    label: "Workers",
    role: "Async",
    logos: [
      { name: "BullMQ", short: "BQ" },
      { name: "Functions", short: "ƒ" },
    ],
  },
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

const STEP_MS = 420;
const LAST = NODES.length - 1;

function Mark({ logo }: { logo: Logo }): React.ReactElement {
  if (logo.path) {
    return (
      <svg viewBox="0 0 24 24" className="arch-mark" role="img" aria-label={logo.name}>
        <title>{logo.name}</title>
        <path d={logo.path} fill="currentColor" />
      </svg>
    );
  }
  return (
    <span className="arch-mark arch-mark--mono" role="img" aria-label={logo.name} title={logo.name}>
      {logo.short}
    </span>
  );
}

export function ArchitecturePatterns(): React.ReactElement {
  const [pulse, setPulse] = useState(-1);
  const [tracing, setTracing] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback((): void => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const trace = useCallback((): void => {
    clearTimers();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPulse(LAST);
      return;
    }
    setTracing(true);
    setPulse(-1);
    NODES.forEach((_, i) => {
      const t = window.setTimeout(
        () => {
          setPulse(i);
          if (i === LAST) setTracing(false);
        },
        120 + i * STEP_MS,
      );
      timers.current.push(t);
    });
  }, [clearTimers]);

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
            The stack behind an AI-native product, wired end to end. Send a request and follow it
            through the tools.
          </p>
        </Reveal>

        <Reveal delay={0.14} className="arch-stage">
          <div className="arch-controls">
            <button
              type="button"
              className="btn btn-primary arch-trace"
              onClick={trace}
              disabled={tracing}
            >
              {tracing ? "Tracing" : "Trace a request"}
            </button>
          </div>

          <div className="arch-flow" aria-label="Request path">
            {NODES.map((node, i) => (
              <div className="arch-cell" key={node.id}>
                <div className={`arch-card${pulse >= i ? " is-lit" : ""}`}>
                  <div className="arch-card-marks">
                    {node.logos.map((l) => (
                      <Mark key={l.name} logo={l} />
                    ))}
                  </div>
                  <span className="arch-card-label">{node.label}</span>
                  <span className="arch-card-role">{node.role}</span>
                </div>
                {i < LAST ? (
                  <div
                    className={`arch-link${pulse >= i + 1 ? " is-live" : ""}`}
                    aria-hidden="true"
                  >
                    <span className="arch-link-line" />
                    <span className="arch-link-dot" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

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
        </Reveal>
      </div>
    </section>
  );
}
