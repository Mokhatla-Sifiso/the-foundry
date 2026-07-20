import { Reveal } from "@/components/primitives/Reveal";

/* ------------------------------------------------------------------ *
 * A delivery timeline (Gantt). Everything is positioned along a single
 * day axis: left = start/TOTAL, width = duration/TOTAL. Short bars keep
 * a readable min-width. An illustrative, generic engagement — not a
 * specific client project.
 * ------------------------------------------------------------------ */
const TOTAL = 110; // days (~3.5 months, with trailing buffer)
const NOW = 18;
const ROWS = 8;

type Variant = "fill" | "glass" | "accent" | "accent-solid";
type Task = Readonly<{ name: string; days: number; start: number; row: number; variant: Variant }>;
// one lane per phase, in logical delivery order
const TASKS: readonly Task[] = [
  { name: "Research", days: 4, start: 0, row: 0, variant: "fill" },
  { name: "Business Analysis", days: 25, start: 4, row: 1, variant: "glass" },
  { name: "Wireframes, proto", days: 12, start: 12, row: 2, variant: "fill" },
  { name: "WF Testing", days: 4, start: 24, row: 3, variant: "fill" },
  { name: "UI design", days: 15, start: 28, row: 4, variant: "glass" },
  { name: "Sync", days: 2, start: 32, row: 5, variant: "accent-solid" },
  { name: "Development", days: 45, start: 34, row: 6, variant: "accent" },
  { name: "Feedback", days: 2, start: 80, row: 7, variant: "glass" },
];

type Milestone = Readonly<{ name: string; day: number }>;
const MILESTONES: readonly Milestone[] = [
  { name: "Kickoff", day: 0 },
  { name: "Dev Start", day: 34 },
  { name: "Ship", day: 82 },
];

type Tick = Readonly<{ label: string; day: number }>;
const TICKS: readonly Tick[] = [
  { label: "Feb 15", day: 0 },
  { label: "Mar 1", day: 15 },
  { label: "Mar 15", day: 30 },
  { label: "Apr 1", day: 45 },
  { label: "Apr 15", day: 60 },
  { label: "May 1", day: 75 },
  { label: "May 15", day: 90 },
  { label: "May 30", day: 105 },
];

const pct = (day: number): string => `${(day / TOTAL) * 100}%`;

const ORDERED: readonly Task[] = [...TASKS].sort((a, b) => a.start - b.start);
const MAX_DAYS = Math.max(...TASKS.map((t) => t.days));

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
              <span className="wfp-top-dur">≈ 3.5 months</span>
            </div>

            <div className="wfp-axis">
              {TICKS.map((t) => (
                <span key={t.label} className="wfp-tick" style={{ left: pct(t.day) }}>
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
                <span key={t.label} className="wfp-grid" style={{ left: pct(t.day) }} aria-hidden="true" />
              ))}
              <span className="wfp-now-line" style={{ left: pct(NOW) }} aria-hidden="true" />

              {TASKS.map((t) => (
                <div
                  key={t.name}
                  className={`wfp-bar wfp-bar--${t.variant}`}
                  style={{ left: pct(t.start), width: pct(t.days), top: `calc(${t.row} * var(--lane))` }}
                >
                  <span className="wfp-bar-name">{t.name}</span>
                  <span className="wfp-bar-days">{t.days} days</span>
                </div>
              ))}

              {MILESTONES.map((m) => (
                <div key={m.name} className="wfp-ms" style={{ left: pct(m.day) }}>
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
            <span className="wfp-m-dur">≈ 3.5 months</span>
          </div>
          <div className="wfp-m-list">
            {ORDERED.map((t) => (
              <div key={t.name} className={`wfp-m-row wfp-m-row--${t.variant}`}>
                <div className="wfp-m-top">
                  <span className="wfp-m-name">{t.name}</span>
                  <span className="wfp-m-days">{t.days} days</span>
                </div>
                <span className="wfp-m-track" aria-hidden="true">
                  <span className="wfp-m-bar" style={{ width: `${(t.days / MAX_DAYS) * 100}%` }} />
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
