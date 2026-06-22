"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/primitives/Reveal";
import { Approved } from "@/components/recruiter/Approved";
import { Gate } from "@/components/recruiter/Gate";
import { Otp } from "@/components/recruiter/Otp";
import { Screening } from "@/components/recruiter/Screening";
import { SignIn } from "@/components/recruiter/SignIn";
import { SignUp, type SignUpData } from "@/components/recruiter/SignUp";
import { TopBar } from "@/components/recruiter/TopBar";
import {
  genCode,
  loadAccounts,
  LS_SESSION,
  saveAccounts,
  type RecruiterAccount,
  type ScreenResult,
} from "@/lib/recruiter";
import "./recruiter.css";

type Step = "gate" | "signup" | "signin" | "otp" | "screening" | "approved";

type FlowData = Partial<SignUpData> & {
  verifiedAt?: number;
  screen?: ScreenResult;
    _mode?: "signin";
};

const screenVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

const screenTransition = { duration: 0.45, ease: EASE };

export default function RecruiterPage(): React.ReactElement {
  const [step, setStep] = useState<Step>("gate");
  const [data, setData] = useState<FlowData>({});
  const [code, setCode] = useState<string>(() => genCode());
  const [otpError, setOtpError] = useState<string | undefined>();

  
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    const session = window.localStorage.getItem(LS_SESSION);
    if (!session) return;
    const accounts = loadAccounts();
    const account = accounts[session.toLowerCase()];
    if (account) {
      
      
      
      
      
      setData(account);
      setStep("approved");
    }
  }, []);

  
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (step !== "approved") return;
    if (!data.email) return;
    window.localStorage.setItem(LS_SESSION, data.email.toLowerCase());
  }, [step, data.email]);

  const go = useCallback((next: Step | "otp-signin"): void => {
    setOtpError(undefined);
    if (next === "otp-signin") {
      setCode(genCode());
      setData((d) => ({ ...d, _mode: "signin" }));
      setStep("otp");
      return;
    }
    if (next === "otp") {
      setCode(genCode());
      setStep("otp");
      return;
    }
    if (next === "signup" || next === "signin" || next === "gate") {
      setData((d) => ({ ...d, _mode: undefined }));
      setStep(next);
      return;
    }
    setStep(next);
  }, []);

  const mode: "signup" | "signin" = data._mode === "signin" ? "signin" : "signup";

  const handleSignUpSubmit = useCallback(
    (form: SignUpData): void => {
      setData((d) => ({ ...d, ...form }));
      go("otp");
    },
    [go],
  );

  const handleSignInCode = useCallback(
    (email: string): void => {
      const accounts = loadAccounts();
      const account = accounts[email.toLowerCase()];
      if (!account) return; 
      setData(account);
      go("otp-signin");
    },
    [go],
  );

  const handleOtpVerify = useCallback(
    (entered: string): void => {
      if (entered !== code) {
        setOtpError("That code doesn't match. Try again.");
        return;
      }
      setOtpError(undefined);
      if (mode === "signin") {
        go("approved");
      } else {
        setStep("screening");
      }
    },
    [code, mode, go],
  );

  const screen = useCallback(async (): Promise<ScreenResult> => {
    
    
    return { decision: "approve", reason: "Verified via work email and domain." };
  }, []);

  const handleScreeningDone = useCallback(
    (result: ScreenResult): void => {
      if (!data.email) return;
      const rec: RecruiterAccount = {
        name: data.name ?? "",
        email: data.email,
        company: data.company ?? "",
        role: data.role ?? "",
        url: data.url ?? "",
        verifiedAt: Date.now(),
        screen: result,
      };
      const accounts = loadAccounts();
      accounts[data.email.toLowerCase()] = rec;
      saveAccounts(accounts);
      setData(rec);
      go("approved");
    },
    [data.email, data.name, data.company, data.role, data.url, go],
  );

  const handleSignOut = useCallback((): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_SESSION);
    }
    setData({});
    go("gate");
  }, [go]);

  const approvedAccount = useMemo<RecruiterAccount | null>(() => {
    if (step !== "approved") return null;
    if (!data.email || !data.name) return null;
    return {
      name: data.name,
      email: data.email,
      company: data.company ?? "",
      role: data.role ?? "",
      url: data.url ?? "",
      
      
      
      verifiedAt: data.verifiedAt ?? 0,
      screen: data.screen,
    };
  }, [step, data]);

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
                  onRequestAccess={() => go("signup")}
                  onHaveAccess={() => go("signin")}
                />
              ) : null}
              {step === "signup" ? (
                <SignUp
                  initial={data}
                  onBack={() => go("gate")}
                  onSubmit={handleSignUpSubmit}
                  onAlreadyVerified={() => go("signin")}
                />
              ) : null}
              {step === "signin" ? (
                <SignIn
                  onBack={() => go("gate")}
                  onCode={handleSignInCode}
                  onNewHere={() => go("signup")}
                />
              ) : null}
              {step === "otp" ? (
                <Otp
                  email={data.email ?? ""}
                  code={code}
                  error={otpError}
                  onVerify={handleOtpVerify}
                  onResend={() => setCode(genCode())}
                />
              ) : null}
              {step === "screening" && data.email ? (
                <Screening
                  email={data.email}
                  screen={screen}
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
