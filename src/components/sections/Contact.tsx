"use client";
import { useState } from "react";
import { Arrow } from "@/components/primitives/icons";
import { Reveal } from "@/components/primitives/Reveal";
import { CONTACT_INTENTS, SITE, type ContactIntent } from "@/lib/constants";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact(): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<ContactIntent>("contract");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (status === "sending") return;
    setError("");
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      setError("Add your name, a valid email, and a short message.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, intent, message, website }),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      setStatus("error");
      setError(data?.message ?? "Could not send your message.");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  function reset(): void {
    setName("");
    setEmail("");
    setIntent("contract");
    setMessage("");
    setStatus("idle");
    setError("");
  }

  return (
    <section id="contact" className="collab sec">
      <div className="wrap">
        <div className="collab-grid">
          <div className="collab-info">
            <Reveal>
              <h2 className="collab-h">
                Let&apos;s build something <span className="em">worth shipping.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="collab-lead">
                Tell me what you&apos;re building. I read every message myself and reply personally,
                usually within a day.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <a className="collab-mail" href={`mailto:${SITE.email}`}>
                <span className="collab-mail-v">{SITE.email}</span>
                <span className="collab-mail-ar" aria-hidden="true">
                  <Arrow />
                </span>
              </a>
            </Reveal>
            <Reveal delay={0.14}>
              <dl className="collab-meta">
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={SITE.phoneHref}>{SITE.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>Based in</dt>
                  <dd>{SITE.location}</dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.08} as="div" className="collab-formwrap">
            {status === "sent" ? (
              <div className="collab-done" role="status">
                <span className="collab-done-mark" aria-hidden="true">
                  <Arrow />
                </span>
                <h3 className="collab-done-h">Message sent.</h3>
                <p className="collab-done-p">
                  Thanks, {name.split(" ")[0] || "there"}. It&apos;s in my inbox and I&apos;ll reply
                  personally, usually within a day.
                </p>
                <button type="button" className="collab-textbtn" onClick={reset}>
                  Send another
                </button>
              </div>
            ) : (
              <form className="collab-form" onSubmit={handleSubmit} noValidate>
                <div className="collab-hp" aria-hidden="true">
                  <label htmlFor="collab-website">Leave this empty</label>
                  <input
                    id="collab-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div className="collab-line">
                  <label className="collab-field">
                    <span className="collab-label">Name</span>
                    <input
                      type="text"
                      name="name"
                      autoComplete="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="collab-field">
                    <span className="collab-label">Email</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <fieldset className="collab-intent">
                  <legend className="collab-label">What&apos;s this about?</legend>
                  <div className="collab-chips">
                    {CONTACT_INTENTS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`collab-chip${intent === opt.value ? " collab-chip--on" : ""}`}
                        aria-pressed={intent === opt.value}
                        onClick={() => setIntent(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="collab-field">
                  <span className="collab-label">Message</span>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="A sentence on the project, timeline, or what you need."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </label>

                {error ? (
                  <p className="collab-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <button type="submit" className="collab-send" disabled={status === "sending"}>
                  {status === "sending" ? "Sending" : "Send message"}
                  <span className="collab-send-ar" aria-hidden="true">
                    <Arrow />
                  </span>
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
