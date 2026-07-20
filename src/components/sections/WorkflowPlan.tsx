import { Reveal } from "@/components/primitives/Reveal";

/* ------------------------------------------------------------------ *
 * A delivery timeline (Gantt) for the enterprise SDLC. Bars are placed
 * along a single relative axis (left = start, width = length) so the
 * shape reads — Development is clearly the largest phase — but no
 * specific times are shown: no durations, dates, week numbers or total.
 * Positions/lengths are unitless, illustrative of the standard split.
 * ------------------------------------------------------------------ */
const TOTAL = 20;
const NOW = 4;
const ROWS = 8;

type Variant = "fill" | "glass" | "accent" | "accent-solid";
type Task = Readonly<{ name: string; length: number; start: number; row: number; variant: Variant }>;
// lengths follow the standard SDLC effort split (development is the largest phase)
const TASKS: readonly Task[] = [
  { name: "Discovery", length: 1, start: 0, row: 0, variant: "fill" },
  { name: "Requirements Analysis", length: 2, start: 1, row: 1, variant: "glass" },
  { name: "Architecture & Design", length: 3, start: 3, row: 2, variant: "fill" },
  { name: "Development", length: 8, start: 5, row: 3, variant: "accent" },
  { name: "QA & Testing", length: 3, start: 10, row: 4, variant: "glass" },
  { name: "UAT", length: 1, start: 13, row: 5, variant: "fill" },
  { name: "Release", length: 1, start: 14, row: 6, variant: "accent-solid" },
  { name: "Hypercare", length: 1, start: 15, row: 7, variant: "glass" },
];

type Milestone = Readonly<{ name: string; at: number }>;
const MILESTONES: readonly Milestone[] = [
  { name: "Kickoff", at: 0 },
  { name: "Build start", at: 5 },
  { name: "Go-live", at: 15 },
];

const GRID: readonly number[] = [0, 4, 8, 12, 16]; // gridline positions — unlabelled

const pct = (n: number): string => `${(n / TOTAL) * 100}%`;
const ORDERED: readonly Task[] = [...TASKS].sort((a, b) => a.start - b.start);
const MAX_LEN = Math.max(...TASKS.map((t) => t.length));

export function WorkflowPlan(): React.ReactElement {
  return (
    <section id="workflow" className="sec wfp">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Ways of working
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="wfp-h">
            How I deliver <span className="em">what I ship.</span>
          </h2>
        </Reveal>

        {/* ---------- desktop: the timeline ---------- */}
        <Reveal delay={0.12} className="wfp-scroll">
          <div className="wfp-chart" style={{ ["--rows" as string]: ROWS }}>
            <span className="wfp-top-title">Workflow plan</span>

            <div className="wfp-axis">
              <span className="wfp-now-head" style={{ left: pct(NOW) }}>
                <span className="wfp-now-tri" aria-hidden="true" />
                <span className="wfp-now-pill">Now</span>
              </span>
            </div>

            <div className="wfp-plot">
              {GRID.map((g) => (
                <span key={g} className="wfp-grid" style={{ left: pct(g) }} aria-hidden="true" />
              ))}
              <span className="wfp-now-line" style={{ left: pct(NOW) }} aria-hidden="true" />

              {TASKS.map((t) => (
                <div
                  key={t.name}
                  className={`wfp-bar wfp-bar--${t.variant}`}
                  style={{ left: pct(t.start), width: pct(t.length), top: `calc(${t.row} * var(--lane))` }}
                >
                  <span className="wfp-bar-name">{t.name}</span>
                </div>
              ))}

              {MILESTONES.map((m) => (
                <div key={m.name} className="wfp-ms" style={{ left: pct(m.at) }}>
                  <span className="wfp-ms-dot" aria-hidden="true" />
                  <span className="wfp-ms-label">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- mobile: stacked phase list ---------- */}
        <Reveal delay={0.1} className="wfp-mobile">
          <span className="wfp-m-title">Workflow plan</span>
          <div className="wfp-m-list">
            {ORDERED.map((t) => (
              <div key={t.name} className={`wfp-m-row wfp-m-row--${t.variant}`}>
                <span className="wfp-m-name">{t.name}</span>
                <span className="wfp-m-track" aria-hidden="true">
                  <span className="wfp-m-bar" style={{ width: `${(t.length / MAX_LEN) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
