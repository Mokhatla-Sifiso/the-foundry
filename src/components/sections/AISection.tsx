"use client";
import { Laptop, PhoneDevice, TabletDevice, WatchDevice } from "@/components/devices";
import { Reveal } from "@/components/primitives/Reveal";
import { AILattice } from "./AILattice";
import { AI_WORKFLOW, AI_VALUE } from "@/lib/constants";
type AISectionProps = Readonly<{
  showPhone?: boolean;
  showDesktop?: boolean;
}>;
export function AISection({
  showPhone = true,
  showDesktop = true,
}: AISectionProps = {}): React.ReactElement {
  return (
    <section id="ai" className="ai sec">
      <AILattice />
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          In the workflow
        </Reveal>
        <Reveal>
          <h2 className="ai-h">
            My stack got faster. <span className="em">My judgment stayed mine.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="ai-lead">
            Agents live in my terminal and editor now, handling scaffolding, migrations, tests and
            first drafts across the whole stack. I still own the architecture, the review, and the
            call on what ships. The difference is I get there in hours, not days.
          </p>
        </Reveal>

        <div className="ai-showcase">
          <Reveal className="laptop">
            <Laptop />
          </Reveal>

          {showPhone ? (
            <Reveal className="phone" delay={0.1}>
              <PhoneDevice />
            </Reveal>
          ) : null}

          <Reveal className="watch" delay={0.15}>
            <WatchDevice />
          </Reveal>

          {showDesktop ? (
            <Reveal className="tablet" delay={0.12}>
              <TabletDevice />
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.05}>
          <ol className="ai-flow" aria-label="How I work with AI, step by step">
            {AI_WORKFLOW.map((s) => (
              <li key={s.n} className="ai-flow-step">
                <span className="ai-flow-n">{s.n}</span>
                <span className="ai-flow-t">{s.title}</span>
                <span className="ai-flow-l">{s.line}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="ai-value">
            {AI_VALUE.map((v) => (
              <div key={v.title} className="ai-value-item">
                <h3 className="ai-value-t">{v.title}</h3>
                <p className="ai-value-l">{v.line}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="ai-proof">
            Not a demo: this site&apos;s own access system, its <b>329 tests</b>, and its{" "}
            <b>CI pipeline</b> were built exactly this way.
          </p>
        </Reveal>

      </div>
    </section>
  );
}
