"use client";

type AgreementChecksProps = Readonly<{
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  onTermsChange: (next: boolean) => void;
  onPrivacyChange: (next: boolean) => void;
  termsLabel?: string;
  error?: string;
  idPrefix?: string;
}>;

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
