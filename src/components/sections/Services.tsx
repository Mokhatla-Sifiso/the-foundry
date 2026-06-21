import { Reveal } from "@/components/primitives/Reveal";
import { SERVICES } from "@/lib/constants";

/**
 * Services — VERBATIM markup + copy + sticky-stack from §7.5.
 *
 * Per-card inline style:
 *   `top: calc(86px + i*18px); zIndex: i + 1`
 * Solid card backgrounds (`--card`) mean each card covers the previous
 * one as the user scrolls — the pinned stacking effect.
 */
const TOTAL = SERVICES.length;

export function Services(): React.ReactElement {
  return (
    <section id="services" className="sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Services
        </Reveal>
        <Reveal delay={0.05} className="statement">
          <p>
            <span className="mut">What I do —</span> front-end-focused,{" "}
            <span className="em">full-stack capable.</span>
          </p>
        </Reveal>

        <div className="stack">
          {SERVICES.map((s, i) => (
            <article
              key={s.w1}
              className="svc-card"
              style={{ top: `calc(86px + ${i * 18}px)`, zIndex: i + 1 }}
            >
              <span className="num">
                {String(i + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
              </span>

              <Reveal>
                <h3>
                  {s.w1}
                  <span className="w2">{s.w2}</span>
                </h3>
              </Reveal>

              <div className="grow" />

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
        </div>
      </div>
    </section>
  );
}
