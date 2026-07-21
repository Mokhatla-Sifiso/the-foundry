import { Reveal } from "@/components/primitives/Reveal";

/* ================================================================== *
 * How I deliver. Every engagement runs the same product path — the
 * Problem-to-Solution model, from Discovery through to Iterate. Each
 * bar is one phase and the deliverable that closes it. A staggered
 * cascade on wide screens, a stacked column on narrow ones.
 * ================================================================== */

interface Phase {
  readonly name: string;
  readonly deliverable: string;
}

const PHASES: readonly Phase[] = [
  { name: "Discovery", deliverable: "Signals, stakeholder interviews, domain research" },
  { name: "Problem Definition", deliverable: "Framed problem, success metrics, constraints" },
  { name: "Solution Architecture", deliverable: "System context, runtime design, tech decisions" },
  { name: "Requirements", deliverable: "Functional and non-functional specs, acceptance criteria" },
  { name: "Design", deliverable: "UX flows, interface contracts, data models" },
  { name: "Build", deliverable: "Production code, integrations, infrastructure" },
  { name: "Test", deliverable: "Unit, integration, end-to-end, coverage gates" },
  { name: "Deploy", deliverable: "CI/CD pipeline, environments, release" },
  { name: "Monitor", deliverable: "Telemetry, tracing, alerting, SLOs" },
  { name: "Iterate", deliverable: "Feedback, hardening, next increment" },
];

const pad = (n: number): string => String(n).padStart(2, "0");
const leftOf = (i: number, n: number): string => `${n > 1 ? (i / (n - 1)) * 50 : 0}%`;

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
        <Reveal delay={0.1}>
          <p className="wfp-lead">
            One repeatable path on every engagement, from first signal to continuous iteration.
          </p>
        </Reveal>

        <Reveal delay={0.14} className="wfp-scroll">
          <ol className="wfp-plot" style={{ ["--rows" as string]: PHASES.length }}>
            {PHASES.map((phase, i) => (
              <li
                key={phase.name}
                className="wfp-bar"
                style={{ ["--l" as string]: leftOf(i, PHASES.length), ["--r" as string]: i }}
              >
                <span className="wfp-idx" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <span className="wfp-body">
                  <span className="wfp-bar-name">{phase.name}</span>
                  <span className="wfp-bar-desc">{phase.deliverable}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
