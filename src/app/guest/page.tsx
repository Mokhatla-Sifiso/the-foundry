"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { EASE } from "@/components/primitives/Reveal";
import { Otp } from "@/components/recruiter/Otp";
import { TopBar } from "@/components/recruiter/TopBar";
import { Field } from "@/components/recruiter/Field";
import { Arrow, IconMail, IconUser, IconLock, IconCheck } from "@/components/primitives/icons";
import { apiFetch } from "@/lib/api";
import { GUEST_RESOURCES, resourceLabel } from "@/lib/access/resources";
import { SITE } from "@/lib/constants";
import "../recruiter/recruiter.css";

type Step = "intro" | "otp" | "form" | "pending" | "granted";
type GuestState = Readonly<{
  status: string;
  expiresAt: number | null;
  resources: ReadonlyArray<string>;
}>;

const variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

export default function GuestPage(): React.ReactElement {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();
  const [picked, setPicked] = useState<ReadonlyArray<string>>([]);
  const [message, setMessage] = useState("");
  const [resumed, setResumed] = useState(false);
  const [nudging, setNudging] = useState(false);
  const [grant, setGrant] = useState<GuestState | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await apiFetch<{
        verified: boolean;
        email?: string;
        name?: string;
        state: GuestState;
      }>("/api/guest/session", { method: "GET", silent: true });
      if (cancelled) return;
      if (res.ok && res.data?.verified) {
        if (res.data.email) setEmail(res.data.email);
        if (res.data.name) setName(res.data.name);
        setGrant(res.data.state);
        if (res.data.state.status === "approved") setStep("granted");
        else if (res.data.state.status === "pending") setStep("pending");
        else setStep("form");
      }
      setResumed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const start = useCallback(async (): Promise<void> => {
    setOtpError(undefined);
    const res = await apiFetch<{ ok: true }>("/api/guest/start", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
    if (!res.ok) return;
    toast.success(`Code sent to ${email}`);
    setStep("otp");
  }, [email, name]);

  const verify = useCallback(
    async (otp: string): Promise<void> => {
      setOtpError(undefined);
      const res = await apiFetch<{ ok: true }>("/api/guest/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp, name }),
        silent: true,
      });
      if (!res.ok) {
        setOtpError(res.error);
        return;
      }
      setStep("form");
    },
    [email, name],
  );

  const resend = useCallback(async (): Promise<void> => {
    const res = await apiFetch<{ ok: true }>("/api/guest/start", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) toast.success("New code sent.");
  }, [email, name]);

  const submit = useCallback(async (): Promise<void> => {
    const res = await apiFetch<{ ok: true; status: string }>("/api/guest/request", {
      method: "POST",
      body: JSON.stringify({ resources: picked, message }),
    });
    if (!res.ok) return;
    toast.success("Request sent.");
    setStep("pending");
  }, [picked, message]);

  const nudge = useCallback(async (): Promise<void> => {
    setNudging(true);
    // No payload: the pending request already holds the resources it was made with.
    const res = await apiFetch<{ ok: true; status: string }>("/api/guest/request", {
      method: "POST",
      body: JSON.stringify({}),
    });
    setNudging(false);
    if (res.ok) toast.success("Nudge sent. Your original request still stands.");
  }, []);

  const toggle = (key: string): void =>
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  // Time, not just the date: a 24-hour window closes mid-day, so "18 Jul" alone
  // would read as end-of-day and overpromise.
  const grantUntil = grant?.expiresAt
    ? new Date(grant.expiresAt).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const grantedKeys = grant?.resources ?? [];
  const hasCv = grantedKeys.includes("cv");
  const otherLabels = grantedKeys.filter((k) => k !== "cv").map(resourceLabel);

  if (!resumed) {
    return (
      <>
        <TopBar />
        <main className="stage" aria-busy="true" />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <main className="stage">
        <div className="card" aria-live="polite">
          <span className="glow" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: EASE }}
            >
              {step === "intro" ? (
                <>
                  <span className="eyebrow">
                    <span className="lock">
                      <IconLock />
                    </span>
                    Guest access
                  </span>
                  <h1 className="t">
                    Request what you need, <span className="em">granted for 24 hours.</span>
                  </h1>
                  <p className="sub">
                    Verify your email, tell me what you would like access to, and I will approve it
                    personally. Approved guests get a 24-hour access window.
                  </p>
                  <div style={{ display: "grid", gap: 12 }}>
                    <Field
                      name="name"
                      label="Your name"
                      value={name}
                      onChange={setName}
                      icon={<IconUser />}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                    <Field
                      name="email"
                      label="Your email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      icon={<IconMail />}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    <button type="button" className="btn btn-primary" onClick={() => void start()}>
                      Send me a code
                      <Arrow />
                    </button>
                  </div>
                </>
              ) : null}

              {step === "otp" ? (
                <Otp
                  email={email}
                  error={otpError}
                  onVerify={(o) => void verify(o)}
                  onResend={() => void resend()}
                />
              ) : null}

              {step === "form" ? (
                <>
                  <h1 className="t">What would you like access to?</h1>
                  <p className="sub">
                    Pick anything relevant. I will review and approve it by email.
                  </p>
                  <div className="gpick">
                    {GUEST_RESOURCES.map((r) => (
                      <label key={r.key} className={picked.includes(r.key) ? "on" : ""}>
                        <input
                          type="checkbox"
                          checked={picked.includes(r.key)}
                          onChange={() => toggle(r.key)}
                        />
                        <span className="gcheck" aria-hidden="true">
                          <IconCheck />
                        </span>
                        {r.label}
                      </label>
                    ))}
                  </div>
                  <textarea
                    className="gtext"
                    rows={3}
                    placeholder="Anything else, or a note on how we might work together? (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void submit()}
                    style={{ marginTop: 16 }}
                  >
                    Send request
                    <Arrow />
                  </button>
                </>
              ) : null}

              {step === "pending" ? (
                <>
                  <span className="eyebrow">
                    <span className="lock">
                      <IconLock />
                    </span>
                    Request received
                  </span>
                  <h1 className="t">
                    You are on the list, <span className="em">give me a moment.</span>
                  </h1>
                  <p className="sub">
                    I review every request personally, so you will get an email at <b>{email}</b>{" "}
                    the moment it is approved. Approved access lasts 24 hours.
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={nudge}
                    disabled={nudging}
                  >
                    {nudging ? "Sending" : "Resend my request"}
                  </button>
                  <div className="note">
                    <span className="b">Prefer to talk</span>
                    <div>
                      Reach me any time at{" "}
                      <a
                        href={`mailto:${SITE.email}`}
                        style={{ color: "var(--candy)", fontWeight: 700 }}
                      >
                        {SITE.email}
                      </a>
                      .
                    </div>
                  </div>
                </>
              ) : null}

              {step === "granted" ? (
                <>
                  <span className="eyebrow">
                    <span className="lock">
                      <IconCheck />
                    </span>
                    Access approved
                  </span>
                  <h1 className="t">
                    You are in{grantUntil ? "," : "."}{" "}
                    {grantUntil ? <span className="em">until {grantUntil}.</span> : null}
                  </h1>
                  <p className="sub">
                    {hasCv ? <>Your CV download is ready below. </> : null}
                    {otherLabels.length ? (
                      <>
                        I will share {otherLabels.join(", ")} with you directly at <b>{email}</b>.
                      </>
                    ) : hasCv ? null : (
                      <>
                        I will be in touch at <b>{email}</b>.
                      </>
                    )}
                  </p>
                  <div style={{ display: "grid", gap: 12 }}>
                    {hasCv ? (
                      <a className="btn btn-primary" href={SITE.cvHref} download>
                        Download the CV
                        <Arrow />
                      </a>
                    ) : null}
                    <a
                      className={hasCv ? "btn btn-ghost" : "btn btn-primary"}
                      href={`mailto:${SITE.email}`}
                    >
                      Email me
                    </a>
                  </div>
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
