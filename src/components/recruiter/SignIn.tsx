"use client";
import { useState } from "react";
import { Arrow, IconBack, IconMail } from "@/components/primitives/icons";
import { Field } from "./Field";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type SignInProps = Readonly<{
  onBack: () => void;
  onCode: (email: string) => void;
  onNewHere: () => void;
}>;
export function SignIn({ onBack, onCode, onNewHere }: SignInProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    onCode(value);
  };
  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onBack}
        aria-label="Back to gate"
        style={{ width: "auto", padding: "0 16px", height: 40, fontSize: 13, marginBottom: 16 }}
      >
        <IconBack />
        Back
      </button>
      <h1 className="t">Welcome back</h1>
      <p className="sub">Sign in with the work email you verified to download the CV again.</p>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          name="signin-email"
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          icon={<IconMail />}
          error={error}
          autoComplete="email"
          autoFocus
        />
        <button type="submit" className="btn btn-primary">
          Send sign-in code
          <Arrow />
        </button>
      </form>

      <div className="alt">
        New here?{" "}
        <a
          role="button"
          onClick={onNewHere}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onNewHere();
          }}
        >
          Request access
        </a>
      </div>
    </>
  );
}
