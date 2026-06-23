"use client";

import { useState } from "react";
import {
  Arrow,
  IconBack,
  IconBrief,
  IconBuild,
  IconLink,
  IconMail,
  IconUser,
} from "@/components/primitives/icons";
import { emailRe } from "@/lib/recruiter";
import { Dots } from "./Dots";
import { Field } from "./Field";

export type SignUpData = Readonly<{
  name: string;
  email: string;
  company: string;
  role: string;
  url: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}>;

type Errors = {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  url?: string;
  consent?: string;
};

type SignUpProps = Readonly<{
  initial?: Partial<SignUpData>;
  onBack: () => void;
  onSubmit: (data: SignUpData) => void;
  onAlreadyVerified: () => void;
}>;

/**
 * SignUp screen — VERBATIM copy + validation from §10.5.
 *
 * 5 fields (name / email / company / role / url) with company + role
 * sharing a `.row2`. On submit, validates per the spec rules and
 * either renders inline errors or fires `onSubmit` with the trimmed
 * values. `Dots step={0}`.
 */
export function SignUp({
  initial,
  onBack,
  onSubmit,
  onAlreadyVerified,
}: SignUpProps): React.ReactElement {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [acceptedTerms, setAcceptedTerms] = useState(initial?.acceptedTerms ?? false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(initial?.acceptedPrivacy ?? false);
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const next: Errors = {};
    const trim = (s: string) => s.trim();

    if (trim(name).length < 2) next.name = "Please enter your full name.";

    if (!emailRe.test(trim(email))) {
      next.email = "Enter a valid email address.";
    }

    if (trim(company).length < 2) next.company = "Which company are you with?";
    if (trim(role).length < 2) next.role = "What role are you hiring for?";
    if (trim(url).length < 4) next.url = "Company website or LinkedIn helps verify you.";
    if (!acceptedTerms || !acceptedPrivacy) {
      next.consent = "Please accept the Recruiter Terms and Privacy Policy to continue.";
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit({
      name: trim(name),
      email: trim(email),
      company: trim(company),
      role: trim(role),
      url: trim(url),
      acceptedTerms,
      acceptedPrivacy,
    });
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
      <Dots step={0} />
      <h1 className="t">Request access</h1>
      <p className="sub">
        A few details so I know who&apos;s asking. Your work email is how I
        confirm you&apos;re with the company you name.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          name="name"
          label="Full name"
          placeholder="Jordan Pillay"
          value={name}
          onChange={setName}
          icon={<IconUser />}
          error={errors.name}
          autoComplete="name"
        />
        <Field
          name="email"
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          icon={<IconMail />}
          error={errors.email}
          autoComplete="email"
        />
        <div className="row2">
          <Field
            name="company"
            label="Company"
            placeholder="Acme Talent"
            value={company}
            onChange={setCompany}
            icon={<IconBuild />}
            error={errors.company}
            autoComplete="organization"
          />
          <Field
            name="role"
            label="Hiring for"
            placeholder="Senior Frontend Engineer"
            value={role}
            onChange={setRole}
            icon={<IconBrief />}
            error={errors.role}
          />
        </div>
        <Field
          name="url"
          label="Company site or LinkedIn"
          placeholder="acme.com  ·  linkedin.com/in/…"
          value={url}
          onChange={setUrl}
          icon={<IconLink />}
          error={errors.url}
        />

        <div className="consent-checks">
          <label className="consent-check">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              I agree to the{" "}
              <a href="/legal/terms" target="_blank" rel="noreferrer">
                Recruiter Terms
              </a>
              .
            </span>
          </label>
          <label className="consent-check">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>
              I&apos;ve read the{" "}
              <a href="/legal/privacy" target="_blank" rel="noreferrer">
                Privacy Policy
              </a>{" "}
              and understand how my details will be used.
            </span>
          </label>
          {errors.consent ? (
            <p id="consent-error" className="consent-check-err" role="alert">
              {errors.consent}
            </p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary">
          Send verification code
          <Arrow />
        </button>
      </form>

      <div className="alt">
        Already verified?{" "}
        <a
          role="button"
          onClick={onAlreadyVerified}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onAlreadyVerified();
          }}
        >
          Sign in
        </a>
      </div>
    </>
  );
}
