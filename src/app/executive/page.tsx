"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { EASE } from "@/components/primitives/Reveal";
import { Otp } from "@/components/recruiter/Otp";
import { TopBar } from "@/components/recruiter/TopBar";
import { Field } from "@/components/recruiter/Field";
import {
  Arrow,
  Cal,
  IconMail,
  IconUser,
  IconLock,
  IconCheck,
  IconLink,
  IconBack,
} from "@/components/primitives/icons";
import { apiFetch } from "@/lib/api";
import { SITE } from "@/lib/constants";
import "../recruiter/recruiter.css";

type Step = "intro" | "otp" | "hub" | "demo" | "repo";
type Requests = Readonly<{ demo: boolean; repo: boolean }>;

const variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

export default function ExecutivePage(): React.ReactElement {
  const [step, setStep] = useState<Step>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();
  const [slot, setSlot] = useState("");
  const [demoTopic, setDemoTopic] = useState("");
  const [repos, setRepos] = useState("");
  const [purpose, setPurpose] = useState("");
  const [requests, setRequests] = useState<Requests>({ demo: false, repo: false });
  const [resumed, setResumed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await apiFetch<{
        verified: boolean;
        email?: string;
        name?: string;
        requests: Requests;
      }>("/api/executive/session", { method: "GET", silent: true });
      if (cancelled) return;
      if (res.ok && res.data?.verified) {
        if (res.data.email) setEmail(res.data.email);
        if (res.data.name) setName(res.data.name);
        setRequests(res.data.requests);
        setStep("hub");
      }
      setResumed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const start = useCallback(async (): Promise<void> => {
    setOtpError(undefined);
    const res = await apiFetch<{ ok: true }>("/api/executive/start", {
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
      const res = await apiFetch<{ ok: true }>("/api/executive/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp, name }),
        silent: true,
      });
      if (!res.ok) {
        setOtpError(res.error);
        return;
      }
      setStep("hub");
    },
    [email, name],
  );

  const resend = useCallback(async (): Promise<void> => {
    const res = await apiFetch<{ ok: true }>("/api/executive/start", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) toast.success("New code sent.");
  }, [email, name]);

  const submitDemo = useCallback(async (): Promise<void> => {
    const res = await apiFetch<{ ok: true }>("/api/executive/demo", {
      method: "POST",
      body: JSON.stringify({ slot, topic: demoTopic }),
    });
    if (!res.ok) return;
    toast.success("Demo request sent.");
    setRequests((r) => ({ ...r, demo: true }));
    setSlot("");
    setDemoTopic("");
    setStep("hub");
  }, [slot, demoTopic]);

  const submitRepo = useCallback(async (): Promise<void> => {
    const res = await apiFetch<{ ok: true }>("/api/executive/repo", {
      method: "POST",
      body: JSON.stringify({ repos, purpose }),
    });
    if (!res.ok) return;
    toast.success("Repo access request sent.");
    setRequests((r) => ({ ...r, repo: true }));
    setRepos("");
    setPurpose("");
    setStep("hub");
  }, [repos, purpose]);

  const firstName = name.split(" ")[0] ?? "";

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
                    Executive access
                  </span>
                  <h1 className="t">
                    A closer look, <span className="em">on your terms.</span>
                  </h1>
                  <p className="sub">
                    Verify your email to book a live demo or request access to the repositories
                    behind the work.
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
                      placeholder="you@company.com"
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

              {step === "hub" ? (
                <>
                  <span className="eyebrow">
                    <span className="lock">
                      <IconCheck />
                    </span>
                    Verified
                  </span>
                  <h1 className="t">
                    What can I set up{firstName ? <>, {firstName}</> : null}?
                  </h1>
                  <p className="sub">
                    Book a live walkthrough, or request access to the code behind a project. Either
                    way I will follow up personally.
                  </p>
                  <div className="exec-opts">
                    <button type="button" className="exec-opt" onClick={() => setStep("demo")}>
                      <span className="exec-opt-ic">
                        <Cal />
                      </span>
                      <span className="exec-opt-tx">
                        <span className="exec-opt-t">
                          Book a demo
                          {requests.demo ? <em className="exec-tag">Requested</em> : null}
                        </span>
                        <span className="exec-opt-d">A live walkthrough of a build, on your schedule.</span>
                      </span>
                      <Arrow />
                    </button>
                    <button type="button" className="exec-opt" onClick={() => setStep("repo")}>
                      <span className="exec-opt-ic">
                        <IconLink />
                      </span>
                      <span className="exec-opt-tx">
                        <span className="exec-opt-t">
                          Request repo access
                          {requests.repo ? <em className="exec-tag">Requested</em> : null}
                        </span>
                        <span className="exec-opt-d">Read access to the repositories behind the work.</span>
                      </span>
                      <Arrow />
                    </button>
                  </div>
                  <div className="note">
                    <span className="b">Prefer email</span>
                    <div>
                      Reach me directly at{" "}
                      <a href={`mailto:${SITE.email}`} style={{ color: "var(--candy)", fontWeight: 700 }}>
                        {SITE.email}
                      </a>
                      .
                    </div>
                  </div>
                </>
              ) : null}

              {step === "demo" ? (
                <>
                  <button type="button" className="exec-back" onClick={() => setStep("hub")}>
                    <IconBack />
                    Back
                  </button>
                  <h1 className="t">Book a demo</h1>
                  <p className="sub">Suggest a slot that suits you and I will confirm by email.</p>
                  <div style={{ display: "grid", gap: 12 }}>
                    <Field
                      name="slot"
                      label="Preferred day & time"
                      value={slot}
                      onChange={setSlot}
                      icon={<Cal />}
                      placeholder="e.g. Tue 22 Jul, afternoon (SAST)"
                    />
                    <textarea
                      className="gtext"
                      rows={3}
                      placeholder="What would you like to see? (optional)"
                      value={demoTopic}
                      onChange={(e) => setDemoTopic(e.target.value)}
                    />
                    <button type="button" className="btn btn-primary" onClick={() => void submitDemo()}>
                      Send demo request
                      <Arrow />
                    </button>
                  </div>
                </>
              ) : null}

              {step === "repo" ? (
                <>
                  <button type="button" className="exec-back" onClick={() => setStep("hub")}>
                    <IconBack />
                    Back
                  </button>
                  <h1 className="t">Request repo access</h1>
                  <p className="sub">
                    Tell me which repositories or projects you would like to see, and I will grant
                    access on GitHub.
                  </p>
                  <div style={{ display: "grid", gap: 12 }}>
                    <Field
                      name="repos"
                      label="Repositories or projects"
                      value={repos}
                      onChange={setRepos}
                      icon={<IconLink />}
                      placeholder="e.g. the-foundry, or a project you saw"
                    />
                    <textarea
                      className="gtext"
                      rows={3}
                      placeholder="What are you evaluating? (optional)"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                    <button type="button" className="btn btn-primary" onClick={() => void submitRepo()}>
                      Send access request
                      <Arrow />
                    </button>
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
