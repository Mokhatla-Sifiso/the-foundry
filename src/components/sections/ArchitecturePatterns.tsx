import {
  siDocker,
  siGithubactions,
  siGrafana,
  siKubernetes,
  siNestjs,
  siOpentelemetry,
  siPostgresql,
  siPrometheus,
  siPulumi,
} from "simple-icons";
import { Reveal } from "@/components/primitives/Reveal";

/* ------------------------------------------------------------------ *
 * Authored on a fixed 1640 x 760 grid. HTML nodes are placed by % of
 * that grid; the SVG wire layer draws on the same grid, so connectors
 * line up with node centres at any width. The flow animates on its own
 * (no trigger) as a slow travelling pulse.
 * ------------------------------------------------------------------ */
const VBW = 1640;
const VBH = 760;
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
  { label: "app.domain.com", y: 318, proto: "HTTPS", entry: [706, 372] },
  { label: "api.domain.com", y: 400, proto: "WSS", entry: [700, 400] },
  { label: "admin.domain.com", y: 482, proto: "Webhooks", entry: [706, 428] },
];

/* ---- zone 2: the gateway, framed by capability pillars (each names its concrete controls) ---- */
type Cap = Readonly<{ label: string; sub: string }>;
const CAPS_TOP: readonly Cap[] = [
  { label: "Guardrails & Security", sub: "authN/Z · tenant isolation · PII redaction" },
  { label: "Model Routing", sub: "model select · fallbacks · rate limits" },
];
const CAPS_BOTTOM: readonly Cap[] = [
  { label: "Retrieval & Tools", sub: "RAG · vector search · tool calling · MCP" },
  { label: "Observability & Evals", sub: "traces · token/cost · SLOs · eval gates" },
];

/* ---- zone 3: infrastructure, grouped into clean platform cards ---- */
type Target = Readonly<{ label: string; icon?: Icon; flow?: "async" }>;
type Group = Readonly<{
  id: string;
  name: string;
  logo: Icon;
  env?: string;
  disco: string; // how the gateway discovers/routes into this platform
  cardY: number;
  targets: readonly Target[];
}>;
const GROUPS: readonly Group[] = [
  {
    id: "k8s",
    name: "Kubernetes",
    logo: { path: siKubernetes.path, name: "Kubernetes" },
    env: "staging / prod",
    disco: "via Ingress · Gateway API · CRDs",
    cardY: 116,
    targets: [{ label: "API services" }, { label: "Background workers" }],
  },
  {
    id: "docker",
    name: "Docker / Compose",
    logo: { path: siDocker.path, name: "Docker" },
    env: "local / dev",
    disco: "via container labels",
    cardY: 312,
    targets: [
      { label: "NestJS BFF", icon: { path: siNestjs.path, name: "NestJS" } },
      { label: "Workers · BullMQ", flow: "async" },
    ],
  },
  {
    id: "models",
    name: "Models & data",
    logo: { path: siPostgresql.path, name: "PostgreSQL" },
    disco: "via LiteLLM model proxy",
    cardY: 508,
    targets: [
      { label: "Claude · GPT · Gemini" },
      { label: "PostgreSQL", icon: { path: siPostgresql.path, name: "PostgreSQL" } },
    ],
  },
];
/* shared card geometry (grid units) */
const CARD = { x: 1264, w: 320, h: 176 } as const;
const ROW_X = CARD.x + 18; // left edge of the header + node rows
const ROW_W = CARD.w - 36;
const cardMidY = (cy: number): number => cy + CARD.h / 2;
const BRANCH: readonly [number, number] = [1120, 400]; // where the fan-out splits
const EXIT: readonly [number, number] = [958, 400]; // gateway right edge

/* ---- cross-cutting toolchain shown under the diagram ---- */
const FOUNDATION: readonly Icon[] = [
  { path: siPulumi.path, name: "Pulumi" },
  { path: siGithubactions.path, name: "GitHub Actions" },
  { path: siOpentelemetry.path, name: "OpenTelemetry" },
  { path: siPrometheus.path, name: "Prometheus" },
  { path: siGrafana.path, name: "Grafana" },
];

type Wire = Readonly<{ d: string; kind: "in" | "trunk" | "out"; marker: boolean }>;

function buildWires(): Wire[] {
  return [
    ...CLIENTS.map(
      (c): Wire => ({ d: curve(348, c.y, c.entry[0], c.entry[1], 0.55), kind: "in", marker: true }),
    ),
    { d: `M ${EXIT[0]} ${EXIT[1]} L ${BRANCH[0]} ${BRANCH[1]}`, kind: "trunk", marker: false },
    // one routing line per platform card
    ...GROUPS.map(
      (g): Wire => ({ d: curve(BRANCH[0], BRANCH[1], CARD.x, cardMidY(g.cardY), 0.5), kind: "out", marker: true }),
    ),
  ];
}

function Logo({ icon, size = 22 }: { icon: Icon; size?: number }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.name}>
      <title>{icon.name}</title>
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

function CapIcon({ i }: { i: number }): React.ReactElement {
  const paths = [
    "M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6l7-3z",
    "M6 5h4a4 4 0 0 1 4 4v6a3 3 0 0 0 3 3M6 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm11 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
    "M9 3v4m6-4v4M7 7h10v3a5 5 0 0 1-10 0V7zm5 8v6",
    "M4 19V5m0 14h16M8 16l3-4 3 2 4-6",
  ];
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[i]} />
    </svg>
  );
}

function LockIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function ArchitecturePatterns(): React.ReactElement {
  const wires = buildWires();

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
          <div className="arch-stage">
            {/* ---------- wire layer ---------- */}
            <svg className="arch-wires" viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <marker id="arw" markerWidth="9" markerHeight="9" refX="6.5" refY="4.5" orient="auto">
                  <path d="M1 1L7 4.5L1 8" fill="none" stroke="var(--arch-wire-strong)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {/* static tracks */}
              {wires.map((w, i) => (
                <path key={`t-${i}`} className={`wire wire--${w.kind}`} d={w.d} markerEnd={w.marker ? "url(#arw)" : undefined} />
              ))}
              {/* travelling pulses */}
              {wires.map((w, i) => (
                <path key={`p-${i}`} className="wire-pulse" style={{ animationDelay: `${(i % 7) * 0.44}s` }} d={w.d} />
              ))}
            </svg>

            {/* ---------- zone group boxes ---------- */}
            <div className="arch-box arch-box--clients" style={{ left: px(70), top: py(278), width: px(350), height: py(244) }} />
            <div className="arch-box arch-box--core" style={{ left: px(600), top: py(72), width: `${(470 / VBW) * 100}%`, height: `${(616 / VBH) * 100}%` }} />
            <div className="arch-box arch-box--infra" style={{ left: px(1242), top: py(96), width: `${(360 / VBW) * 100}%`, height: `${(608 / VBH) * 100}%` }} />
            {GROUPS.map((g) => (
              <div
                key={`box-${g.id}`}
                className="arch-box arch-box--group"
                style={{ left: px(CARD.x), top: py(g.cardY), width: `${(CARD.w / VBW) * 100}%`, height: `${(CARD.h / VBH) * 100}%` }}
              />
            ))}

            {/* ---------- trust boundary: a single divider — left is public internet, right is the client's self-hosted infra ---------- */}
            <div className="arch-divider" style={{ left: px(566), top: py(96), height: `${((704 - 96) / VBH) * 100}%` }} />
            <span className="arch-trust-tag" style={{ left: px(582), top: py(60) }}>
              <LockIcon />
              Client infrastructure · self-hosted
            </span>
            {/* the boundary enforces TLS + authN on every crossing */}
            <span className="arch-ingress" style={{ left: px(566), top: py(300) }}>
              TLS · authN
            </span>

            {/* ---------- zone labels ---------- */}
            <span className="arch-zone" style={{ left: px(78), top: py(252) }}>
              Public internet
            </span>
            <span className="arch-zone" style={{ left: px(1250), top: py(74) }}>
              To your infrastructure
            </span>

            {/* ---------- center header ---------- */}
            <div className="arch-brand" style={{ left: px(835), top: py(122) }}>
              <span className="arch-brand-mark">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M4 8l8-4 8 4-8 4-8-4z" fill="currentColor" opacity="0.9" />
                  <path d="M4 12l8 4 8-4M4 16l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="arch-brand-txt">AI-Native Platform</span>
            </div>

            {/* ---------- client nodes + protocols ---------- */}
            {CLIENTS.map((c) => (
              <span key={c.label} className="arch-node arch-node--client" style={{ left: px(240), top: py(c.y) }}>
                {c.label}
              </span>
            ))}
            {CLIENTS.map((c) => (
              <span key={`p-${c.proto}`} className="arch-proto" style={{ left: px(524), top: py((c.y + c.entry[1]) / 2) }}>
                {c.proto}
              </span>
            ))}

            {/* ---------- capability pillars (concrete controls in the hover title) ---------- */}
            {CAPS_TOP.map((c, i) => (
              <span key={c.label} className="arch-cap" title={c.sub} style={{ left: px(835), top: py(205 + i * 74) }}>
                <CapIcon i={i} />
                {c.label}
              </span>
            ))}
            {/* ---------- the gateway (hero) ---------- */}
            <div className="arch-gw" style={{ left: px(835), top: py(400) }}>
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
            {CAPS_BOTTOM.map((c, i) => (
              <span key={c.label} className="arch-cap" title={c.sub} style={{ left: px(835), top: py(522 + i * 74) }}>
                <CapIcon i={i + 2} />
                {c.label}
              </span>
            ))}

            {/* ---------- infra: clean platform cards ---------- */}
            {GROUPS.map((g) => (
              <div key={`card-${g.id}`}>
                {/* header: platform + environment */}
                <div className="arch-card-head" style={{ left: px(ROW_X), top: py(g.cardY + 30), width: `${(ROW_W / VBW) * 100}%` }}>
                  <span className="arch-card-name">
                    <Logo icon={g.logo} size={17} />
                    {g.name}
                  </span>
                  {g.env ? <span className="arch-card-env">{g.env}</span> : null}
                </div>
                {/* how the gateway reaches this platform */}
                <span className="arch-card-disco" style={{ left: px(ROW_X), top: py(g.cardY + 58) }}>
                  {g.disco}
                </span>
                {/* uniform node rows */}
                {g.targets.map((t, ti) => (
                  <div key={t.label} className="arch-row" style={{ left: px(ROW_X), top: py(g.cardY + 100 + ti * 46), width: `${(ROW_W / VBW) * 100}%` }}>
                    <span className="arch-row-ico">{t.icon ? <Logo icon={t.icon} size={16} /> : null}</span>
                    <span className="arch-row-label">{t.label}</span>
                    {t.flow === "async" ? <span className="arch-row-flow">async</span> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---------- mobile: same story, stacked vertically ---------- */}
        <Reveal delay={0.1} className="arch-mobile">
          {/* zone 1 — public internet */}
          <div className="am-zone">
            <span className="am-label">Public internet</span>
            <div className="am-list">
              {CLIENTS.map((c) => (
                <div key={c.label} className="am-node am-client">
                  <span>{c.label}</span>
                  <span className="am-proto">{c.proto}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="am-flow">
            <LockIcon />
            TLS · authN → self-hosted infra
          </div>

          {/* zone 2 — the platform */}
          <div className="am-core">
            <span className="am-label">AI-Native Platform</span>
            <div className="am-gw">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="am-gw-mark">
                <path d="M4 8l8-4 8 4-8 4-8-4z" fill="currentColor" />
                <path d="M4 12l8 4 8-4M4 16l8 4 8-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
              AI Gateway
            </div>
            <div className="am-caps">
              {[...CAPS_TOP, ...CAPS_BOTTOM].map((c, i) => (
                <span key={c.label} className="am-cap" title={c.sub}>
                  <CapIcon i={i} />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <div className="am-flow">routes to your infrastructure</div>

          {/* zone 3 — infrastructure cards */}
          <div className="am-cards">
            {GROUPS.map((g) => (
              <div key={g.id} className="am-card">
                <div className="am-card-head">
                  <span className="am-card-name">
                    <Logo icon={g.logo} size={16} />
                    {g.name}
                  </span>
                  {g.env ? <span className="am-card-env">{g.env}</span> : null}
                </div>
                <span className="am-card-disco">{g.disco}</span>
                {g.targets.map((t) => (
                  <div key={t.label} className="am-row">
                    <span className="am-row-ico">{t.icon ? <Logo icon={t.icon} size={15} /> : null}</span>
                    <span className="am-row-label">{t.label}</span>
                    {t.flow === "async" ? <span className="am-row-flow">async</span> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <div className="arch-foundation" aria-label="Cross-cutting toolchain">
          <span className="arch-foundation-label">CI · IaC · Observability</span>
          <div className="arch-foundation-marks">
            {FOUNDATION.map((f) => (
              <span className="arch-fmark" key={f.name}>
                <Logo icon={f} size={22} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
