import { Reveal } from "@/components/primitives/Reveal";
import { buildTimeline, fetchMilestones, type Segment, type Timeline } from "@/lib/github";

/* ================================================================== *
 * The "how I deliver" showpiece. When the connected repo has GitHub
 * milestones it renders a LIVE tracker (real progress + dates); with no
 * milestones it falls back to the illustrative SDLC template, so the
 * section is never empty. Server component — data is fetched with ISR.
 * ================================================================== */
export async function WorkflowPlan(): Promise<React.ReactElement> {
  const milestones = await fetchMilestones();
  // Server component rendered at request/revalidate time; Date.now() is the
  // intentional ISR snapshot used to place the "Now" marker.
  // eslint-disable-next-line react-hooks/purity
  const timeline = buildTimeline(milestones, Date.now());

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
        {timeline ? <LiveTimeline timeline={timeline} /> : <TemplateTimeline />}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Live tracker — driven by real GitHub milestones.
 * ------------------------------------------------------------------ */
const p = (frac: number): string => `${frac * 100}%`;
const fmtDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });

function LiveBar({ segment, row }: { segment: Segment; row: number }): React.ReactElement {
  const { milestone: m, left, width } = segment;
  const pctDone = Math.round(m.progress * 100);
  const done = m.state === "closed" || m.progress >= 1;
  const title = `${m.title} — ${m.closed}/${m.total || 0} issues${m.dueOn ? `, due ${fmtDate(m.dueOn)}` : ""}`;
  return (
    <a
      className={`wfp-bar wfp-live${done ? " is-done" : ""}`}
      href={m.url}
      target="_blank"
      rel="noreferrer"
      title={title}
      style={{ left: p(left), width: p(width), top: `calc(${row} * var(--lane))` }}
    >
      <span className="wfp-live-fill" style={{ width: p(m.progress) }} aria-hidden="true" />
      <span className="wfp-bar-name">{m.title}</span>
      <span className="wfp-live-pct">{pctDone}%</span>
    </a>
  );
}

export function LiveTimeline({ timeline }: { timeline: Timeline }): React.ReactElement {
  const rows = timeline.segments.length;
  return (
    <>
      <Reveal delay={0.12} className="wfp-scroll">
        <div className="wfp-chart" style={{ ["--rows" as string]: rows }}>
          <span className="wfp-top-title">
            Workflow plan
            <a className="wfp-live-badge" href={timeline.url} target="_blank" rel="noreferrer">
              <span className="wfp-live-dot" aria-hidden="true" />
              Live · {timeline.repo}
            </a>
          </span>

          <div className="wfp-axis">
            {timeline.months.map((t, i) => (
              <span key={`${t.label}-${i}`} className="wfp-tick" style={{ left: p(t.frac) }}>
                {t.label}
              </span>
            ))}
            <span className="wfp-now-head" style={{ left: p(timeline.nowFrac) }}>
              <span className="wfp-now-tri" aria-hidden="true" />
              <span className="wfp-now-pill">Now</span>
            </span>
          </div>

          <div className="wfp-plot wfp-plot--live">
            {timeline.months.map((t, i) => (
              <span key={`g-${i}`} className="wfp-grid" style={{ left: p(t.frac) }} aria-hidden="true" />
            ))}
            <span className="wfp-now-line" style={{ left: p(timeline.nowFrac) }} aria-hidden="true" />
            {timeline.segments.map((s, i) => (
              <LiveBar key={s.milestone.number} segment={s} row={i} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* mobile */}
      <Reveal delay={0.1} className="wfp-mobile">
        <span className="wfp-m-title">
          Workflow plan
          <a className="wfp-live-badge" href={timeline.url} target="_blank" rel="noreferrer">
            <span className="wfp-live-dot" aria-hidden="true" />
            Live
          </a>
        </span>
        <div className="wfp-m-list">
          {timeline.segments.map((s) => {
            const m = s.milestone;
            const done = m.state === "closed" || m.progress >= 1;
            return (
              <a
                key={m.number}
                className={`wfp-m-row wfp-m-row--live${done ? " is-done" : ""}`}
                href={m.url}
                target="_blank"
                rel="noreferrer"
              >
                <div className="wfp-m-top">
                  <span className="wfp-m-name">{m.title}</span>
                  <span className="wfp-m-pct">{Math.round(m.progress * 100)}%</span>
                </div>
                <span className="wfp-m-track" aria-hidden="true">
                  <span className="wfp-m-bar" style={{ width: p(m.progress) }} />
                </span>
              </a>
            );
          })}
        </div>
      </Reveal>
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Template — illustrative SDLC phases, shown when no milestones exist.
 * No specific times; just the standard delivery flow.
 * ------------------------------------------------------------------ */
const TOTAL = 20;
const NOW = 4;
const ROWS = 8;
type Variant = "fill" | "glass" | "accent" | "accent-solid";
type Task = Readonly<{ name: string; length: number; start: number; row: number; variant: Variant }>;
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
type TMilestone = Readonly<{ name: string; at: number }>;
const T_MILESTONES: readonly TMilestone[] = [
  { name: "Kickoff", at: 0 },
  { name: "Build start", at: 5 },
  { name: "Go-live", at: 15 },
];
const GRID: readonly number[] = [0, 4, 8, 12, 16];
const tp = (n: number): string => `${(n / TOTAL) * 100}%`;
const T_ORDERED: readonly Task[] = [...TASKS].sort((a, b) => a.start - b.start);
const T_MAX = Math.max(...TASKS.map((t) => t.length));

export function TemplateTimeline(): React.ReactElement {
  return (
    <>
      <Reveal delay={0.12} className="wfp-scroll">
        <div className="wfp-chart" style={{ ["--rows" as string]: ROWS }}>
          <span className="wfp-top-title">Workflow plan</span>
          <div className="wfp-axis">
            <span className="wfp-now-head" style={{ left: tp(NOW) }}>
              <span className="wfp-now-tri" aria-hidden="true" />
              <span className="wfp-now-pill">Now</span>
            </span>
          </div>
          <div className="wfp-plot">
            {GRID.map((g) => (
              <span key={g} className="wfp-grid" style={{ left: tp(g) }} aria-hidden="true" />
            ))}
            <span className="wfp-now-line" style={{ left: tp(NOW) }} aria-hidden="true" />
            {TASKS.map((t) => (
              <div
                key={t.name}
                className={`wfp-bar wfp-bar--${t.variant}`}
                style={{ left: tp(t.start), width: tp(t.length), top: `calc(${t.row} * var(--lane))` }}
              >
                <span className="wfp-bar-name">{t.name}</span>
              </div>
            ))}
            {T_MILESTONES.map((m) => (
              <div key={m.name} className="wfp-ms" style={{ left: tp(m.at) }}>
                <span className="wfp-ms-dot" aria-hidden="true" />
                <span className="wfp-ms-label">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="wfp-mobile">
        <span className="wfp-m-title">Workflow plan</span>
        <div className="wfp-m-list">
          {T_ORDERED.map((t) => (
            <div key={t.name} className={`wfp-m-row wfp-m-row--${t.variant}`}>
              <span className="wfp-m-name">{t.name}</span>
              <span className="wfp-m-track" aria-hidden="true">
                <span className="wfp-m-bar" style={{ width: `${(t.length / T_MAX) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </>
  );
}
