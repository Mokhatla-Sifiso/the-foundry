"use client";
import { useState } from "react";
import { Reveal } from "@/components/primitives/Reveal";
import { FAQS, SITE } from "@/lib/constants";

export function Faq(): React.ReactElement {
  const [open, setOpen] = useState<number>(0);

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
          <div className="faq-acc">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div className={`faq-item${isOpen ? " faq-item--open" : ""}`} key={item.q}>
                  <h3 className="faq-qh">
                    <button
                      type="button"
                      className="faq-q"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                    >
                      <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="faq-qt">{item.q}</span>
                      <span className="faq-ic" aria-hidden="true">
                        <span />
                        <span />
                      </span>
                    </button>
                  </h3>
                  <div className="faq-panel" id={`faq-panel-${i}`} role="region">
                    <div className="faq-panel-in">
                      <p className="faq-a">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="faq-foot">
            Still have a question? <a href={`mailto:${SITE.email}`}>Email me directly</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
