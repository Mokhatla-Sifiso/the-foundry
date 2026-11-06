import { Reveal } from "@/components/primitives/Reveal";
import { fetchProject, type Phase, type Project } from "@/lib/github";

/* ================================================================== *
 * Live delivery tracker. The rows are the real product path (the
 * Problem-to-Solution model, Discovery to Iterate); what is live is
 * where this repository sits on that path and its vitality — shipped
 * and open work, last push — pulled from GitHub with ISR. A tracked
 * cascade against a progression axis on wide screens, stacked cards
 * on narrow ones. One responsive chart, no second view.
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
        <Reveal delay={0.1}>
          <p className="wfp-lead">
            The product path I run on every engagement, from first signal to continuous iteration,
            tracked live against this repository.
          </p>
        </Reveal>
        {project ? <Chart project={project} /> : <Unavailable />}
      </div>
    </section>
  );
}

const GRID: readonly number[] = [0.2, 0.4, 0.6, 0.8];
const NOW = 0.965;
const pctOf = (frac: number): string => `${frac * 100}%`;
const leftOf = (i: number, n: number): string => `${n > 1 ? (i / (n - 1)) * 50 : 0}%`;
const pad = (n: number): string => String(n).padStart(2, "0");
const STATUS_LABEL: Record<Phase["status"], string> = {
  complete: "Shipped",
  active: "In progress",
  upcoming: "Next",
};

function Stat({ value, label }: { value: string | number; label: string }): React.ReactElement {
  return (
    <span className="wfp-stat">
      <span className="wfp-stat-n">{value}</span>
      <span className="wfp-stat-l">{label}</span>
    </span>
  );
}

function PhaseBar({ phase, i, n }: { phase: Phase; i: number; n: number }): React.ReactElement {
  const filled = phase.status !== "upcoming";
  return (
    <li
      className={`wfp-bar wfp-bar--${phase.status}`}
      style={{ ["--l" as string]: leftOf(i, n), ["--r" as string]: i }}
    >
      <span className="wfp-fill" style={{ width: filled ? "100%" : "0%" }} aria-hidden="true" />
      <span className="wfp-idx" aria-hidden="true">
        {pad(i + 1)}
      </span>
      <span className="wfp-body">
        <span className="wfp-bar-name">{phase.name}</span>
        <span className="wfp-bar-desc">{phase.deliverable}</span>
      </span>
      <span className="wfp-status">{STATUS_LABEL[phase.status]}</span>
    </li>
  );
}

function Chart({ project }: { project: Project }): React.ReactElement {
  const { tracker, fullName, url, pushedAgo, shipped, inProgress } = project;
  const rows = tracker.total;
  return (
    <>
      <Reveal delay={0.12} className="wfp-stats">
        <a className="wfp-repo" href={url} target="_blank" rel="noreferrer">
          {fullName}
        </a>
        <Stat value={shipped} label="shipped" />
        <Stat value={inProgress} label="in progress" />
        <Stat value={`${tracker.completeCount}/${rows}`} label="phases" />
        <span className="wfp-updated">Updated {pushedAgo}</span>
      </Reveal>

      <Reveal delay={0.16} className="wfp-scroll">
        <div className="wfp-plot" style={{ ["--rows" as string]: rows }}>
          {GRID.map((g) => (
            <span key={g} className="wfp-grid" style={{ left: pctOf(g) }} aria-hidden="true" />
          ))}
          <span className="wfp-now-line" style={{ left: pctOf(NOW) }} aria-hidden="true" />
          <span className="wfp-now-head" style={{ left: pctOf(NOW) }}>
            <span className="wfp-now-label">Now</span>
          </span>
          <ol className="wfp-rows">
            {tracker.phases.map((phase, i) => (
              <PhaseBar key={phase.name} phase={phase} i={i} n={rows} />
            ))}
          </ol>
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
