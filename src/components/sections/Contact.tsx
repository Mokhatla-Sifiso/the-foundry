"use client";
import { useState } from "react";
import { Chat } from "@/components/primitives/icons";
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
          <div className="collab-intro">
            <Reveal>
              <h2 className="collab-h">
                Let&apos;s build something <span className="em">worth shipping.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <ul className="collab-points">
                <li>Contract and freelance engagements</li>
                <li>Full-stack builds, microfrontends, and architecture</li>
                <li>A considered reply, from me directly</li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="collab-alt">
                Prefer email?{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.08} as="div" className="collab-formwrap">
            {status === "sent" ? (
              <div className="collab-done" role="status">
                <h3 className="collab-done-h">Message sent.</h3>
                <p className="collab-done-p">
                  Thanks, {name.split(" ")[0] || "there"}. It&apos;s in my inbox and I&apos;ll get
                  back to you personally.
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

                <label className="collab-field">
                  <span className="collab-label">Name</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="collab-field">
                  <span className="collab-label">What&apos;s this about?</span>
                  <select value={intent} onChange={(e) => setIntent(e.target.value as ContactIntent)}>
                    {CONTACT_INTENTS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

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
                  className="btn btn-primary collab-send"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending" : "Send message"}
                  <span className="ic">
                    <Chat />
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
