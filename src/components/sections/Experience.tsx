import { Reveal } from "@/components/primitives/Reveal";
import { XP } from "@/lib/constants";

/**
 * Experience — VERBATIM markup + copy from §7.7.
 *
 * Heading uses inline style per spec; row stagger is `i * 0.04` so
 * each row enters slightly after the previous one.
 */
export function Experience(): React.ReactElement {
  return (
    <section id="experience" className="sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          Experience
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: "clamp(30px, 4.6vw, 60px)",
              letterSpacing: "-.035em",
              lineHeight: 1,
              marginBottom: 44,
              maxWidth: "18ch",
            }}
          >
            Five years building <span style={{ color: "var(--candy)" }}>at scale.</span>
          </h2>
        </Reveal>

        <div className="xp-list">
          {XP.map((row, i) => (
            <Reveal key={`${row.role}-${i}`} className="xp-row" delay={i * 0.04}>
              <div className="role">{row.role}</div>
              <div className="org">{row.org}</div>
              <div className="when">
                {row.now ? <span className="now">● </span> : null}
                {row.when}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
