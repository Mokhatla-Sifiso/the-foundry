import { Reveal } from "@/components/primitives/Reveal";
import { FAQS, SITE } from "@/lib/constants";

export function Faq(): React.ReactElement {
  return (
    <section id="faq" className="faq sec">
      <div className="wrap">
        <div className="faq-grid">
          <div className="faq-aside">
            <Reveal>
              <h2 className="faq-h">Questions, answered.</h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="faq-sub">A few things worth knowing before we start.</p>
            </Reveal>
            <Reveal delay={0.1}>
              <a className="faq-ask" href={`mailto:${SITE.email}`}>
                Still curious? Email me
              </a>
            </Reveal>
          </div>
          <Reveal delay={0.05} as="div" className="faq-list">
            {FAQS.map((item) => (
              <div className="faq-item" key={item.q}>
                <h3 className="faq-q">{item.q}</h3>
                <p className="faq-a">{item.a}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
