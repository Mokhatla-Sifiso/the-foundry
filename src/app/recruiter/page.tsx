"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { EASE } from "@/components/primitives/Reveal";
import { Approved } from "@/components/recruiter/Approved";
import { Gate } from "@/components/recruiter/Gate";
import { Otp } from "@/components/recruiter/Otp";
import { Screening } from "@/components/recruiter/Screening";
import { SignIn } from "@/components/recruiter/SignIn";
import { SignUp, type SignUpData } from "@/components/recruiter/SignUp";
import { TopBar } from "@/components/recruiter/TopBar";
import { apiFetch } from "@/lib/api";
import "./recruiter.css";

type Step = "gate" | "signup" | "signin" | "otp" | "screening" | "approved";

type Account = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  verifiedAt: number;
  isAdmin: boolean;
  screen: { decision: "pending" | "approve" | "reject"; reason: string } | null;
}>;

type Mode = "signup" | "signin";

const screenVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};
const screenTransition = { duration: 0.45, ease: EASE };

export default function RecruiterPage(): React.ReactElement {
  const [step, setStep] = useState<Step>("gate");
  const [mode, setMode] = useState<Mode>("signup");
  const [signupDraft, setSignupDraft] = useState<SignUpData | null>(null);
  const [signinEmail, setSigninEmail] = useState<string>("");
  const [account, setAccount] = useState<Account | null>(null);
  const [otpError, setOtpError] = useState<string | undefined>();
  const [resumed, setResumed] = useState(false);

  // Resume on mount — if the BetterAuth session cookie is still valid,
  // jump straight to Approved with the freshest account snapshot.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await apiFetch<{ account: Account | null }>("/api/recruiter/session", {
        method: "GET",
        silent: true,
      });
      if (cancelled) return;
      if (res.ok && res.data?.account) {
        setAccount(res.data.account);
        setStep("approved");
      }
      setResumed(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignUpSubmit = useCallback(async (form: SignUpData): Promise<void> => {
    setSignupDraft(form);
    setMode("signup");
    setOtpError(undefined);
    const res = await apiFetch<{ ok: true }>("/api/recruiter/signup/start", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    toast.success(`Code sent to ${form.email}`);
    setStep("otp");
  }, []);

  const handleSignInSubmit = useCallback(async (email: string): Promise<void> => {
    setSigninEmail(email);
    setMode("signin");
    setOtpError(undefined);
    const res = await apiFetch<{ ok: true }>("/api/recruiter/signin/start", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return;
    toast.success(`Code sent to ${email}`);
    setStep("otp");
  }, []);

  const handleOtpVerify = useCallback(
    async (entered: string): Promise<void> => {
      setOtpError(undefined);
      if (mode === "signup") {
        if (!signupDraft) {
          toast.error("Session expired. Please request access again.");
          setStep("signup");
          return;
        }
        const res = await apiFetch<{ account: Account }>("/api/recruiter/signup/verify", {
          method: "POST",
          body: JSON.stringify({ ...signupDraft, otp: entered }),
          silent: true,
        });
        if (!res.ok) {
          setOtpError(res.error);
          return;
        }
        setAccount(res.data.account);
        setStep("screening");
        return;
      }

      // signin
      const res = await apiFetch<{ account: Account }>("/api/recruiter/signin/verify", {
        method: "POST",
        body: JSON.stringify({ email: signinEmail, otp: entered }),
        silent: true,
      });
      if (!res.ok) {
        setOtpError(res.error);
        return;
      }
      setAccount(res.data.account);
      setStep("approved");
    },
    [mode, signupDraft, signinEmail],
  );

  const handleResend = useCallback(async (): Promise<void> => {
    if (mode === "signup" && signupDraft) {
      const res = await apiFetch<{ ok: true }>("/api/recruiter/signup/start", {
        method: "POST",
        body: JSON.stringify(signupDraft),
      });
      if (res.ok) toast.success("New code sent.");
    } else if (mode === "signin" && signinEmail) {
      const res = await apiFetch<{ ok: true }>("/api/recruiter/signin/start", {
        method: "POST",
        body: JSON.stringify({ email: signinEmail }),
      });
      if (res.ok) toast.success("New code sent.");
    }
  }, [mode, signupDraft, signinEmail]);

  const runScreening = useCallback(async (): Promise<{
    decision: "approve" | "review";
    reason: string;
  }> => {
    const res = await apiFetch<{ account: Account }>("/api/recruiter/screen", {
      method: "POST",
    });
    if (!res.ok || !res.data.account.screen) {
      return { decision: "approve", reason: "Verified via work email and domain." };
    }
    setAccount(res.data.account);
    const { decision, reason } = res.data.account.screen;
    return { decision: decision === "reject" ? "review" : "approve", reason };
  }, []);

  const handleScreeningDone = useCallback((): void => {
    setStep("approved");
  }, []);

  const handleSignOut = useCallback(async (): Promise<void> => {
    await apiFetch<{ ok: true }>("/api/recruiter/signout", { method: "POST" });
    setAccount(null);
    setSignupDraft(null);
    setSigninEmail("");
    setStep("gate");
  }, []);

  const otpTargetEmail = mode === "signup" ? (signupDraft?.email ?? "") : signinEmail;

  const approvedAccount = useMemo(() => {
    if (!account) return null;
    return {
      name: account.name,
      email: account.email,
      company: account.company,
      role: account.role,
      url: account.url,
      verifiedAt: account.verifiedAt,
      screen: account.screen
        ? {
            decision: account.screen.decision === "reject" ? ("review" as const) : ("approve" as const),
            reason: account.screen.reason,
          }
        : undefined,
    };
  }, [account]);

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
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={screenTransition}
            >
              {step === "gate" ? (
                <Gate
                  onRequestAccess={() => {
                    setMode("signup");
                    setStep("signup");
                  }}
                  onHaveAccess={() => {
                    setMode("signin");
                    setStep("signin");
                  }}
                />
              ) : null}
              {step === "signup" ? (
                <SignUp
                  initial={signupDraft ?? undefined}
                  onBack={() => setStep("gate")}
                  onSubmit={handleSignUpSubmit}
                  onAlreadyVerified={() => {
                    setMode("signin");
                    setStep("signin");
                  }}
                />
              ) : null}
              {step === "signin" ? (
                <SignIn
                  onBack={() => setStep("gate")}
                  onCode={handleSignInSubmit}
                  onNewHere={() => {
                    setMode("signup");
                    setStep("signup");
                  }}
                />
              ) : null}
              {step === "otp" ? (
                <Otp
                  email={otpTargetEmail}
                  error={otpError}
                  onVerify={handleOtpVerify}
                  onResend={handleResend}
                />
              ) : null}
              {step === "screening" && account ? (
                <Screening
                  email={account.email}
                  screen={runScreening}
                  onDone={handleScreeningDone}
                />
              ) : null}
              {step === "approved" && approvedAccount ? (
                <Approved account={approvedAccount} onSignOut={handleSignOut} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}
