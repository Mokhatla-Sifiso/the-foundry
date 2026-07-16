"use client";
import { useEffect, useState } from "react";
import { Arrow, IconCheck, IconMail } from "@/components/primitives/icons";
import { Reveal } from "@/components/primitives/Reveal";
import { CONTACT_INTENTS, SITE, type ContactIntent } from "@/lib/constants";

type Status = "idle" | "sending" | "sent" | "error";

function useLocalTime(): string | null {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = (): string =>
      new Intl.DateTimeFormat("en-ZA", {
        timeZone: "Africa/Johannesburg",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
    const raf = window.requestAnimationFrame(() => setTime(format()));
    const id = window.setInterval(() => setTime(format()), 30_000);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, []);
  return time;
}

export function Contact(): React.ReactElement {
  const localTime = useLocalTime();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<ContactIntent>("contract");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

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
        <Reveal>
          <div className="collab-card">
            <div className="collab-left">
              <span className="collab-status">
                <span className="collab-dot" aria-hidden="true" />
                Available for contract &amp; freelance
              </span>
              <h2 className="collab-h">
                Let&apos;s build something <span className="em">worth shipping.</span>
              </h2>
              <p className="collab-lead">
                Tell me what you&apos;re building. I read every message myself and come back to you
                personally, usually within a day.
              </p>

              <div className="collab-channels">
                <button type="button" className="collab-chan collab-copy" onClick={copyEmail}>
                  <span className="collab-chan-ic">{copied ? <IconCheck /> : <IconMail />}</span>
                  <span className="collab-chan-body">
                    <span className="collab-chan-k">{copied ? "Copied" : "Email"}</span>
                    <span className="collab-chan-v">{SITE.email}</span>
                  </span>
                </button>
                <a className="collab-chan" href={SITE.phoneHref}>
                  <span className="collab-chan-body">
                    <span className="collab-chan-k">Phone</span>
                    <span className="collab-chan-v">{SITE.phone}</span>
                  </span>
                </a>
                <div className="collab-chan collab-chan--static">
                  <span className="collab-chan-body">
                    <span className="collab-chan-k">Based in</span>
                    <span className="collab-chan-v">
                      {SITE.location}
                      {localTime ? <span className="collab-time"> · {localTime} local</span> : null}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="collab-right">
              {status === "sent" ? (
                <div className="collab-done" role="status">
                  <span className="collab-done-ic">
                    <IconCheck />
                  </span>
                  <h3 className="collab-done-h">Message sent.</h3>
                  <p className="collab-done-p">
                    Thanks, {name.split(" ")[0] || "there"}. It landed in my inbox and I&apos;ll reply
                    personally, usually within a day.
                  </p>
                  <button type="button" className="collab-reset" onClick={reset}>
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

                  <div className="collab-row">
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
                      rows={4}
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

                  <button
                    type="submit"
                    className="collab-submit"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Sending…" : "Send message"}
                    <span className="collab-submit-ic" aria-hidden="true">
                      <Arrow />
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
