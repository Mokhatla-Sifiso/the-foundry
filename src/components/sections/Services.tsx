import { Reveal } from "@/components/primitives/Reveal";
import { StackScaleEffect } from "@/components/primitives/StackScaleEffect";
import { SERVICES } from "@/lib/constants";
const TOTAL = SERVICES.length;
export function Services(): React.ReactElement {
  return (
    <section id="services" className="sec services-section">
      <div className="wrap services-head">
        <Reveal as="span" className="eyebrow">
          Services
        </Reveal>
        <Reveal delay={0.05} className="statement">
          <p>
            <span className="mut">What I do:</span> front-end-focused,{" "}
            <span className="em">full-stack capable.</span>
          </p>
        </Reveal>
      </div>

      <StackScaleEffect />
      <div className="stack">
        {SERVICES.map((s, i) => (
          <article
            key={s.w1}
            className={`svc-card svc-card--${i}`}
            style={
              {
                zIndex: i + 1,
                "--i": i,
                ...(i > 0 ? { marginTop: "12vh" } : {}),
              } as React.CSSProperties
            }
          >
            <span className="num">
              {String(i + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
            </span>

            <Reveal>
              <h3 className="svc-h">
                <span className="svc-h-l1">{s.w1}</span>
                <span className="svc-h-l2">{s.w2}</span>
              </h3>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="svc-pills">
                {s.pills.map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </div>
              <div className="svc-desc">
                <span className="ast" aria-hidden="true">
                  ✳
                </span>
                <p>{s.d}</p>
              </div>
            </Reveal>
          </article>
        ))}

        <div className="stack-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}
