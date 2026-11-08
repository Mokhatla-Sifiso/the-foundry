"use client";

type AgreementChecksProps = Readonly<{
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  onTermsChange: (next: boolean) => void;
  onPrivacyChange: (next: boolean) => void;
  /** The name the terms carry in this journey, e.g. "Recruiter Terms". */
  termsLabel?: string;
  error?: string;
  /** Keeps the error id unique when a page renders more than one set. */
  idPrefix?: string;
}>;

/**
 * The consent gate shared by every journey that issues a session: recruiter,
 * guest and executive. One implementation so the wording, the links and the
 * accessibility wiring cannot drift apart between flows.
 */
export function AgreementChecks({
  acceptedTerms,
  acceptedPrivacy,
  onTermsChange,
  onPrivacyChange,
  termsLabel = "Terms of Use",
  error,
  idPrefix = "consent",
}: AgreementChecksProps): React.ReactElement {
  const errorId = `${idPrefix}-error`;
  const describedBy = error ? errorId : undefined;
  return (
    <div className="consent-checks">
      <label className="consent-check">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          aria-describedby={describedBy}
        />
        <span>
          I agree to the{" "}
          <a href="/legal/terms" target="_blank" rel="noreferrer">
            {termsLabel}
          </a>
          .
        </span>
      </label>
      <label className="consent-check">
        <input
          type="checkbox"
          checked={acceptedPrivacy}
          onChange={(e) => onPrivacyChange(e.target.checked)}
          aria-describedby={describedBy}
        />
        <span>
          I&apos;ve read the{" "}
          <a href="/legal/privacy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>{" "}
          and understand how my details will be used.
        </span>
      </label>
      {error ? (
        <p id={errorId} className="consent-check-err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
