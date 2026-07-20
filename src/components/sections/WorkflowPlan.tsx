import { Reveal } from "@/components/primitives/Reveal";

/* ------------------------------------------------------------------ *
 * A delivery timeline (Gantt). Everything is positioned along a single
 * day axis: left = start/TOTAL, width = duration/TOTAL. Short bars keep
 * a readable min-width. An illustrative, generic engagement — not a
 * specific client project.
 * ------------------------------------------------------------------ */
const TOTAL = 20; // weeks on the axis (16-week engagement + trailing room)
const NOW = 4;
const ROWS = 8;

// Industry-standard enterprise delivery lifecycle (SDLC), with phase
// durations set to the classic effort split — ~15% analysis, 15% design,
// 40% development, 20% testing, 10% release/hypercare — so Development is
// the single largest phase (build is 40-60% of the work per the sources).
type Variant = "fill" | "glass" | "accent" | "accent-solid";
type Task = Readonly<{ name: string; weeks: number; start: number; row: number; variant: Variant }>;
const TASKS: readonly Task[] = [
  { name: "Discovery", weeks: 1, start: 0, row: 0, variant: "fill" },
  { name: "Requirements Analysis", weeks: 2, start: 1, row: 1, variant: "glass" },
  { name: "Architecture & Design", weeks: 3, start: 3, row: 2, variant: "fill" },
  { name: "Development", weeks: 8, start: 5, row: 3, variant: "accent" },
  { name: "QA & Testing", weeks: 3, start: 10, row: 4, variant: "glass" },
  { name: "UAT", weeks: 1, start: 13, row: 5, variant: "fill" },
  { name: "Release", weeks: 1, start: 14, row: 6, variant: "accent-solid" },
  { name: "Hypercare", weeks: 1, start: 15, row: 7, variant: "glass" },
];

type Milestone = Readonly<{ name: string; week: number }>;
const MILESTONES: readonly Milestone[] = [
  { name: "Kickoff", week: 0 },
  { name: "Build start", week: 5 },
  { name: "Go-live", week: 15 },
];

type Tick = Readonly<{ label: string; week: number }>;
const TICKS: readonly Tick[] = [
  { label: "Wk 0", week: 0 },
  { label: "Wk 4", week: 4 },
  { label: "Wk 8", week: 8 },
  { label: "Wk 12", week: 12 },
  { label: "Wk 16", week: 16 },
];

const pct = (week: number): string => `${(week / TOTAL) * 100}%`;
const dur = (weeks: number): string => `${weeks} ${weeks === 1 ? "week" : "weeks"}`;

const ORDERED: readonly Task[] = [...TASKS].sort((a, b) => a.start - b.start);
const MAX_WEEKS = Math.max(...TASKS.map((t) => t.weeks));

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
            <div className="wfp-top">
              <span className="wfp-top-title">Workflow plan</span>
              <span className="wfp-top-dur">16 weeks</span>
            </div>

            <div className="wfp-axis">
              {TICKS.map((t) => (
                <span key={t.label} className="wfp-tick" style={{ left: pct(t.week) }}>
                  {t.label}
                </span>
              ))}
              <span className="wfp-now-head" style={{ left: pct(NOW) }}>
                <span className="wfp-now-tri" aria-hidden="true" />
                <span className="wfp-now-pill">Now</span>
              </span>
            </div>

            <div className="wfp-plot">
              {TICKS.map((t) => (
                <span key={t.label} className="wfp-grid" style={{ left: pct(t.week) }} aria-hidden="true" />
              ))}
              <span className="wfp-now-line" style={{ left: pct(NOW) }} aria-hidden="true" />

              {TASKS.map((t) => (
                <div
                  key={t.name}
                  className={`wfp-bar wfp-bar--${t.variant}`}
                  style={{ left: pct(t.start), width: pct(t.weeks), top: `calc(${t.row} * var(--lane))` }}
                >
                  <span className="wfp-bar-name">{t.name}</span>
                  <span className="wfp-bar-days">{dur(t.weeks)}</span>
                </div>
              ))}

              {MILESTONES.map((m) => (
                <div key={m.name} className="wfp-ms" style={{ left: pct(m.week) }}>
                  <span className="wfp-ms-dot" aria-hidden="true" />
                  <span className="wfp-ms-label">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- mobile: stacked phase list ---------- */}
        <Reveal delay={0.1} className="wfp-mobile">
          <div className="wfp-m-head">
            <span className="wfp-m-title">Workflow plan</span>
            <span className="wfp-m-dur">16 weeks</span>
          </div>
          <div className="wfp-m-list">
            {ORDERED.map((t) => (
              <div key={t.name} className={`wfp-m-row wfp-m-row--${t.variant}`}>
                <div className="wfp-m-top">
                  <span className="wfp-m-name">{t.name}</span>
                  <span className="wfp-m-days">{dur(t.weeks)}</span>
                </div>
                <span className="wfp-m-track" aria-hidden="true">
                  <span className="wfp-m-bar" style={{ width: `${(t.weeks / MAX_WEEKS) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
