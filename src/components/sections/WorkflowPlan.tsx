import { Reveal } from "@/components/primitives/Reveal";

/* ------------------------------------------------------------------ *
 * The enterprise delivery lifecycle (SDLC) shown as an ordered sequence
 * of phases — discovery through hypercare. No schedule or durations,
 * just the flow. Desktop staggers the phases into a cascade; mobile
 * stacks them as a numbered list.
 * ------------------------------------------------------------------ */
type Variant = "fill" | "glass" | "accent" | "accent-solid";
type Phase = Readonly<{ name: string; variant: Variant }>;
const PHASES: readonly Phase[] = [
  { name: "Discovery", variant: "fill" },
  { name: "Requirements Analysis", variant: "glass" },
  { name: "Architecture & Design", variant: "fill" },
  { name: "Development", variant: "accent" },
  { name: "QA & Testing", variant: "glass" },
  { name: "UAT", variant: "fill" },
  { name: "Release", variant: "accent-solid" },
  { name: "Hypercare", variant: "glass" },
];
const STEP = 8.6; // % horizontal offset per phase — the staggered cascade
const num = (i: number): string => String(i + 1).padStart(2, "0");

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

        {/* ---------- desktop: staggered phase cascade ---------- */}
        <Reveal delay={0.12} className="wfp-scroll">
          <div className="wfp-chart" style={{ ["--rows" as string]: PHASES.length }}>
            <span className="wfp-top-title">Workflow plan</span>
            <div className="wfp-plot">
              {PHASES.map((p, i) => (
                <div
                  key={p.name}
                  className={`wfp-bar wfp-bar--${p.variant}`}
                  style={{ left: `${i * STEP}%`, top: `calc(${i} * var(--lane))` }}
                >
                  <span className="wfp-bar-num">{num(i)}</span>
                  <span className="wfp-bar-name">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- mobile: numbered phase list ---------- */}
        <Reveal delay={0.1} className="wfp-mobile">
          <span className="wfp-m-title">Workflow plan</span>
          <div className="wfp-m-list">
            {PHASES.map((p, i) => (
              <div key={p.name} className={`wfp-m-row wfp-m-row--${p.variant}`}>
                <span className="wfp-bar-num">{num(i)}</span>
                <span className="wfp-m-name">{p.name}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
