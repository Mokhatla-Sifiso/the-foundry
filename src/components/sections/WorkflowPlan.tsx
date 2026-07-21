import { Reveal } from "@/components/primitives/Reveal";
import { fetchProject, type Pull, type Timeline } from "@/lib/github";

/* ================================================================== *
 * Live delivery timeline — the recent pull requests of the connected
 * repo, drawn as a Gantt-style chart. Only the valuable signal: what
 * shipped (title), whether it's merged or still open (colour), and
 * roughly when (position). Server component, fetched with ISR.
 * ================================================================== */
export async function WorkflowPlan(): Promise<React.ReactElement> {
  const project = await fetchProject();
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
        {project ? (
          <Chart timeline={project.timeline} repo={project.fullName} url={project.url} pushedAgo={project.pushedAgo} />
        ) : (
          <Unavailable />
        )}
      </div>
    </section>
  );
}

const p = (frac: number): string => `${frac * 100}%`;
const GRID: readonly number[] = [0.14, 0.34, 0.54, 0.74];

function Bar({ pull, left, row }: { pull: Pull; left: number; row: number }): React.ReactElement {
  return (
    <a
      className={`wfp-bar wfp-bar--${pull.state}`}
      href={pull.url}
      target="_blank"
      rel="noreferrer"
      title={`${pull.state === "merged" ? "Merged" : pull.state === "open" ? "Open" : "Closed"}: ${pull.title}`}
      style={{ left: p(left), top: `calc(${row} * var(--lane))` }}
    >
      <span className="wfp-bar-name">{pull.title}</span>
    </a>
  );
}

function Chart({
  timeline,
  repo,
  url,
  pushedAgo,
}: {
  timeline: Timeline;
  repo: string;
  url: string;
  pushedAgo: string;
}): React.ReactElement {
  const rows = timeline.segments.length;
  return (
    <>
      {/* desktop timeline */}
      <Reveal delay={0.12} className="wfp-scroll">
        <div className="wfp-chart" style={{ ["--rows" as string]: rows }}>
          <span className="wfp-top-title">
            Recent delivery
            <a className="wfp-live-badge" href={url} target="_blank" rel="noreferrer">
              <span className="wfp-live-dot" aria-hidden="true" />
              Live · {repo} · {pushedAgo}
            </a>
          </span>

          <div className="wfp-axis">
            <span className="wfp-now-head" style={{ left: p(timeline.nowFrac) }}>
              <span className="wfp-now-tri" aria-hidden="true" />
              <span className="wfp-now-pill">Now</span>
            </span>
          </div>

          <div className="wfp-plot">
            {GRID.map((g) => (
              <span key={g} className="wfp-grid" style={{ left: p(g) }} aria-hidden="true" />
            ))}
            <span className="wfp-now-line" style={{ left: p(timeline.nowFrac) }} aria-hidden="true" />
            {timeline.segments.map((s, i) => (
              <Bar key={s.pull.number} pull={s.pull} left={s.left} row={i} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* mobile list */}
      <Reveal delay={0.1} className="wfp-mobile">
        <span className="wfp-m-title">
          Recent delivery
          <a className="wfp-live-badge" href={url} target="_blank" rel="noreferrer">
            <span className="wfp-live-dot" aria-hidden="true" />
            Live
          </a>
        </span>
        <div className="wfp-m-list">
          {timeline.segments.map((s) => (
            <a
              key={s.pull.number}
              className={`wfp-m-row wfp-m-row--${s.pull.state}`}
              href={s.pull.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="wfp-m-name">{s.pull.title}</span>
            </a>
          ))}
        </div>
      </Reveal>
    </>
  );
}

export { Chart as WorkflowChart };

function Unavailable(): React.ReactElement {
  return (
    <Reveal delay={0.12} className="wfp-scroll">
      <p className="wfp-empty">
        Live delivery data is briefly unavailable.{" "}
        <a href="https://github.com/Mokhatla-Sifiso/the-foundry" target="_blank" rel="noreferrer">
          View the repository on GitHub →
        </a>
      </p>
    </Reveal>
  );
}
