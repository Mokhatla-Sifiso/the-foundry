"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  siDocker,
  siGithubactions,
  siGrafana,
  siKubernetes,
  siNestjs,
  siOllama,
  siOpentelemetry,
  siPostgresql,
  siPrometheus,
  siPulumi,
} from "simple-icons";
import { Reveal } from "@/components/primitives/Reveal";

/* ------------------------------------------------------------------ *
 * The diagram is authored on a fixed 1640 x 1040 grid. HTML nodes are
 * placed by percentage of that grid; the SVG wire layer draws on the
 * same grid, so connectors line up with node centres at any width.
 * ------------------------------------------------------------------ */
const VBW = 1640;
const VBH = 1040;
const px = (x: number): string => `${(x / VBW) * 100}%`;
const py = (y: number): string => `${(y / VBH) * 100}%`;
const curve = (x1: number, y1: number, x2: number, y2: number, k = 0.5): string => {
  const dx = (x2 - x1) * k;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
};

type Icon = Readonly<{ path: string; name: string }>;

/* ---- zone 1: clients entering over a protocol ---- */
type Client = Readonly<{ label: string; y: number; proto: string; entry: readonly [number, number] }>;
const CLIENTS: readonly Client[] = [
  { label: "app.domain.com", y: 420, proto: "HTTPS", entry: [706, 524] },
  { label: "api.domain.com", y: 520, proto: "WSS", entry: [700, 560] },
  { label: "admin.domain.com", y: 620, proto: "Webhooks", entry: [706, 596] },
];

/* ---- zone 2: the gateway, framed by capability pillars ---- */
const CAPS_TOP = ["Guardrails & Security", "Model Routing"] as const;
const CAPS_BOTTOM = ["Retrieval & Tools", "Observability & Evals"] as const;

/* ---- zone 3: infrastructure, grouped by platform + discovery mechanism ---- */
type Target = Readonly<{ label: string; y: number; icon?: Icon }>;
type Group = Readonly<{
  id: string;
  name: string;
  logo: Icon;
  tag: string;
  tagY: number;
  box: Readonly<{ x: number; y: number; w: number; h: number }>;
  targets: readonly Target[];
}>;
const GROUPS: readonly Group[] = [
  {
    id: "k8s",
    name: "Kubernetes",
    logo: { path: siKubernetes.path, name: "Kubernetes" },
    tag: "Ingress · Gateway API · CRDs",
    tagY: 250,
    box: { x: 1286, y: 224, w: 300, h: 208 },
    targets: [
      { label: "Inference · GPU", y: 318 },
      { label: "API Service", y: 384 },
    ],
  },
  {
    id: "docker",
    name: "Docker / Compose",
    logo: { path: siDocker.path, name: "Docker" },
    tag: "Labels & Tags",
    tagY: 500,
    box: { x: 1286, y: 470, w: 300, h: 208 },
    targets: [
      { label: "NestJS BFF", y: 562, icon: { path: siNestjs.path, name: "NestJS" } },
      { label: "Workers · BullMQ", y: 628 },
    ],
  },
  {
    id: "data",
    name: "Data & Models",
    logo: { path: siPostgresql.path, name: "PostgreSQL" },
    tag: "LiteLLM · Config",
    tagY: 754,
    box: { x: 1286, y: 726, w: 300, h: 208 },
    targets: [
      { label: "Postgres · pgvector", y: 818, icon: { path: siPostgresql.path, name: "PostgreSQL" } },
      { label: "Ollama · LLMs", y: 884, icon: { path: siOllama.path, name: "Ollama" } },
    ],
  },
];
const TARGET_X = 1352; // left edge the wires arrive at
const BRANCH: readonly [number, number] = [1120, 560]; // where the fan-out splits
const EXIT: readonly [number, number] = [958, 560]; // gateway right edge

/* ---- cross-cutting toolchain shown under the diagram ---- */
const FOUNDATION: readonly Icon[] = [
  { path: siPulumi.path, name: "Pulumi" },
  { path: siGithubactions.path, name: "GitHub Actions" },
  { path: siOpentelemetry.path, name: "OpenTelemetry" },
  { path: siPrometheus.path, name: "Prometheus" },
  { path: siGrafana.path, name: "Grafana" },
];

function Logo({ icon, size = 22 }: { icon: Icon; size?: number }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.name}>
      <title>{icon.name}</title>
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

function CapIcon({ i }: { i: number }): React.ReactElement {
  // 0 shield, 1 route, 2 plug, 3 chart
  const paths = [
    "M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z",
    "M6 5h4a4 4 0 0 1 4 4v6a3 3 0 0 0 3 3M6 5v0m0 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm11 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    "M9 3v4m6-4v4M7 7h10v3a5 5 0 0 1-10 0V7zm5 8v6",
    "M4 19V5m0 14h16M8 16l3-4 3 2 4-6",
  ];
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[i]} />
    </svg>
  );
}

function Check(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
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
    timer.current = window.setTimeout(() => setLive(false), 3200);
  }, [clear]);

  // flat target list for the fan-out wires + staggered lighting
  const targets = GROUPS.flatMap((g) => g.targets);

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

        <Reveal delay={0.12} className="arch-scroll">
          <div className={`arch-stage${live ? " is-live" : ""}`}>
            {/* ---------- wire layer ---------- */}
            <svg className="arch-wires" viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <marker id="arw" markerWidth="9" markerHeight="9" refX="6.5" refY="4.5" orient="auto">
                  <path d="M1 1L7 4.5L1 8" fill="none" stroke="var(--arch-wire-strong)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>

              {/* clients -> gateway */}
              {CLIENTS.map((c) => (
                <path key={`in-${c.label}`} className="wire wire--in" d={curve(348, c.y, c.entry[0], c.entry[1], 0.55)} markerEnd="url(#arw)" />
              ))}

              {/* gateway -> branch trunk */}
              <path className="wire wire--trunk" d={`M ${EXIT[0]} ${EXIT[1]} L ${BRANCH[0]} ${BRANCH[1]}`} />

              {/* discovery-mechanism lines (dashed, accent) */}
              {GROUPS.map((g) => (
                <path key={`tag-${g.id}`} className="wire wire--tag" d={curve(BRANCH[0], BRANCH[1], 1206, g.tagY, 0.55)} />
              ))}

              {/* branch -> each target */}
              {targets.map((t, i) => (
                <path
                  key={`out-${t.label}`}
                  className="wire wire--out"
                  style={{ ["--i" as string]: i } as React.CSSProperties}
                  d={curve(BRANCH[0], BRANCH[1], TARGET_X, t.y, 0.5)}
                  markerEnd="url(#arw)"
                />
              ))}
            </svg>

            {/* ---------- zone group boxes ---------- */}
            <div className="arch-box arch-box--clients" style={{ left: px(70), top: py(340), width: px(350), height: py(360) }} />
            <div className="arch-box arch-box--core" style={{ left: px(600), top: py(110), width: `${(470 / VBW) * 100}%`, height: `${(852 / VBH) * 100}%` }} />
            <div className="arch-box arch-box--infra" style={{ left: px(1150), top: py(150), width: `${(448 / VBW) * 100}%`, height: `${(808 / VBH) * 100}%` }} />
            {GROUPS.map((g) => (
              <div
                key={`box-${g.id}`}
                className="arch-box arch-box--group"
                style={{ left: px(g.box.x), top: py(g.box.y), width: `${(g.box.w / VBW) * 100}%`, height: `${(g.box.h / VBH) * 100}%` }}
              />
            ))}

            {/* ---------- zone labels ---------- */}
            <span className="arch-zone" style={{ left: px(78), top: py(300) }}>
              From the client
            </span>
            <span className="arch-zone" style={{ left: px(1158), top: py(120) }}>
              To your infrastructure
            </span>

            {/* ---------- center header ---------- */}
            <div className="arch-brand" style={{ left: px(835), top: py(168) }}>
              <span className="arch-brand-mark">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M4 8l8-4 8 4-8 4-8-4z" fill="currentColor" opacity="0.9" />
                  <path d="M4 12l8 4 8-4M4 16l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="arch-brand-txt">AI-Native Platform</span>
            </div>

            {/* ---------- client nodes ---------- */}
            {CLIENTS.map((c) => (
              <span key={c.label} className="arch-node arch-node--client" style={{ left: px(240), top: py(c.y) }}>
                {c.label}
              </span>
            ))}
            {/* protocol pills sit on the wires */}
            {CLIENTS.map((c) => (
              <span key={`p-${c.proto}`} className="arch-proto" style={{ left: px(524), top: py((c.y + c.entry[1]) / 2) }}>
                {c.proto}
              </span>
            ))}

            {/* ---------- capability pillars ---------- */}
            {CAPS_TOP.map((label, i) => (
              <span key={label} className="arch-cap" style={{ left: px(835), top: py(288 + i * 92) }}>
                <CapIcon i={i} />
                {label}
              </span>
            ))}
            {/* ---------- the gateway (hero) ---------- */}
            <div className="arch-gw" style={{ left: px(835), top: py(560) }}>
              <span className="arch-gw-glow" aria-hidden="true" />
              <span className="arch-gw-grid" aria-hidden="true" />
              <span className="arch-gw-pill">
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" className="arch-gw-mark">
                  <path d="M4 8l8-4 8 4-8 4-8-4z" fill="currentColor" />
                  <path d="M4 12l8 4 8-4M4 16l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
                AI Gateway
              </span>
            </div>
            {CAPS_BOTTOM.map((label, i) => (
              <span key={label} className="arch-cap" style={{ left: px(835), top: py(732 + i * 92) }}>
                <CapIcon i={i + 2} />
                {label}
              </span>
            ))}

            {/* ---------- infra: platform groups ---------- */}
            {GROUPS.map((g) => (
              <div key={`hdr-${g.id}`}>
                {/* discovery tag pill */}
                <span className="arch-mech" style={{ left: px(1206), top: py(g.tagY) }}>
                  <Check />
                  {g.tag}
                </span>
                {/* platform name + logo */}
                <span className="arch-plat" style={{ left: px(g.box.x + g.box.w - 12), top: py(g.box.y + 30) }}>
                  <Logo icon={g.logo} size={20} />
                  {g.name}
                </span>
                {/* target nodes */}
                {g.targets.map((t) => (
                  <span key={t.label} className="arch-node arch-node--target" style={{ left: px(TARGET_X + 100), top: py(t.y) }}>
                    {t.icon ? <Logo icon={t.icon} size={18} /> : null}
                    {t.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <div className="arch-controls">
          <button type="button" className="btn btn-primary arch-trace" onClick={trace}>
            Trace a request
          </button>
          <div className="arch-foundation" aria-label="Cross-cutting toolchain">
            <span className="arch-foundation-label">CI · IaC · Observability</span>
            <div className="arch-foundation-marks">
              {FOUNDATION.map((f) => (
                <span className="arch-fmark" key={f.name}>
                  <Logo icon={f} size={23} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
