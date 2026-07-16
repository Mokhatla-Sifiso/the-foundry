import { Reveal } from "@/components/primitives/Reveal";
import { FAQS, SITE } from "@/lib/constants";

export function Faq(): React.ReactElement {
  return (
    <section id="faq" className="faq sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          FAQ
        </Reveal>
        <Reveal>
          <h2 className="faq-h">Questions, answered.</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="faq-grid">
            {FAQS.map((item, i) => (
              <div className="faq-card" key={item.q}>
                <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="faq-q">{item.q}</h3>
                <p className="faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="faq-foot">
            Still have a question?{" "}
            <a href={`mailto:${SITE.email}`}>Email me directly</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
