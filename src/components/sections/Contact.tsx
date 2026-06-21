import { Cal, Chat } from "@/components/primitives/icons";
import { Reveal } from "@/components/primitives/Reveal";
import { SITE } from "@/lib/constants";

/**
 * Contact — VERBATIM markup + copy from §7.9. "Don't be shy." headline,
 * two action buttons (mailto + /recruiter), 3-column meta grid.
 */
export function Contact(): React.ReactElement {
  return (
    <section id="contact" className="contact sec">
      <div className="wrap">
        <Reveal>
          <div className="contact-card">
            <div className="blob" aria-hidden="true" />
            <span className="eyebrow">Contact · Available 2026</span>
            <h2>
              Don&apos;t
              <br />
              be <span className="w2">shy.</span>
            </h2>

            <div className="c-actions">
              <a className="btn btn-primary" href={`mailto:${SITE.email}`}>
                Start a conversation
                <span className="ic">
                  <Chat />
                </span>
              </a>
              <a className="btn btn-light" href="/recruiter">
                Download CV
                <span className="ic">
                  <Cal />
                </span>
              </a>
            </div>

            <div className="c-meta">
              <a href={`mailto:${SITE.email}`}>
                <span className="k">Email</span>
                <span className="v">{SITE.email}</span>
              </a>
              <a href={SITE.phoneHref}>
                <span className="k">Phone</span>
                <span className="v">{SITE.phone}</span>
              </a>
              <div>
                <span className="k">Located</span>
                <span className="v">{SITE.location}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
