import { Reveal } from "@/components/primitives/Reveal";
import { SERVICES } from "@/lib/constants";

const STACK_TOP_BASE_PX = 80;
const STACK_TOP_STEP_PX = 100;
const TOTAL = SERVICES.length;

/**
 * Sticky-stack cards. All cards are direct children of one .stack div —
 * this is required for position:sticky to keep ALL prior cards pinned
 * simultaneously while the new card rises over them.
 */
export function Services(): React.ReactElement {
  return (
    <section id="services" className="sec services-section">
      <div className="wrap services-head">
        <Reveal as="span" className="eyebrow">
          Services
        </Reveal>
        <Reveal delay={0.05} className="statement">
          <p>
            <span className="mut">What I do —</span> front-end-focused,{" "}
            <span className="em">full-stack capable.</span>
          </p>
        </Reveal>
      </div>

      <div className="stack">
        {SERVICES.map((s, i) => (
          <article
            key={s.w1}
            className={`svc-card svc-card--${i % 2 === 0 ? "even" : "odd"}`}
            style={{
              top: `calc(${STACK_TOP_BASE_PX}px + ${i * STACK_TOP_STEP_PX}px)`,
              zIndex: i + 1,
              ...(i > 0 ? { marginTop: "12vh" } : {}),
            }}
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
                <span className="ast" aria-hidden="true">✳</span>
                <p>{s.d}</p>
              </div>
            </Reveal>
          </article>
        ))}
        {/* Spacer gives the last card reading room while all prior cards stay pinned */}
        <div className="stack-spacer" aria-hidden="true" />
      </div>
    </section>
  );
}
