import { Reveal } from "@/components/primitives/Reveal";
import { FAQS } from "@/lib/constants";

export function Faq(): React.ReactElement {
  return (
    <section id="faq" className="faq sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          FAQ
        </Reveal>
        <Reveal>
          <h2 className="faq-h">A few common questions.</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="faq-list">
            {FAQS.map((item) => (
              <details className="faq-item" key={item.q} name="faq">
                <summary className="faq-q">
                  <span>{item.q}</span>
                  <span className="faq-ic" aria-hidden="true" />
                </summary>
                <p className="faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
