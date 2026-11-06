"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { Bell, IconAlert, IconCheck } from "@/components/primitives/icons";
import type { NotifyInput, NotifyState } from "@/hooks/useNotifySignup";
import "./buttons.css";
import "./form.css";

export interface NotifyFormProps {
  titleId: string;
  descId: string;
  state: Exclude<NotifyState, { status: "submitted" }>;
  onSubmit: (input: NotifyInput) => void;
  /** Called when the visitor edits a field that is showing an error, to clear it. */
  onEdit: () => void;
  /** The email field, so the dialog can focus it when it opens. */
  emailRef: RefObject<HTMLInputElement | null>;
}

/**
 * The notify sign-up form (spec UG 4.7): email, consent, a hidden honeypot and the submit
 * button. Errors sit under the control they belong to (G9), and focus moves to that control.
 */
export function NotifyForm({
  titleId,
  descId,
  state,
  onSubmit,
  onEdit,
  emailRef,
}: NotifyFormProps): React.ReactElement {
  const consentRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");

  useEffect(() => {
    if (state.status === "invalid") {
      (state.field === "email" ? emailRef : consentRef).current?.focus();
    }
  }, [state, emailRef]);

  const busy = state.status === "submitting";
  const emailError = state.status === "invalid" && state.field === "email" ? state.message : null;
  const consentError =
    state.status === "invalid" && state.field === "consent" ? state.message : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!busy) onSubmit({ email, consent, website });
  };

  return (
    <>
      <h2 id={titleId}>Get one email when it&apos;s live</h2>
      <p id={descId} className="ug-dialog__desc">
        No newsletter. One email when the new version is live, then your address is deleted.
      </p>
      {state.status === "failed" ? (
        <div className="ug-alert" role="alert">
          <IconAlert />
          <span>{state.message}</span>
        </div>
      ) : null}
      <form className="ug-form" noValidate onSubmit={handleSubmit} aria-busy={busy}>
        <div className="ug-field">
          <label htmlFor={`${titleId}-email`}>Email address</label>
          <input
            ref={emailRef}
            id={`${titleId}-email`}
            className="ug-input"
            type="email"
            name="email"
            autoComplete="email"
            required
            readOnly={busy}
            value={email}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? `${titleId}-email-error` : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) onEdit();
            }}
          />
          {emailError ? (
            <p id={`${titleId}-email-error`} className="ug-error">
              <IconAlert />
              <span>{emailError}</span>
            </p>
          ) : null}
        </div>
        <div className="ug-consent">
          <label className="ug-check">
            <input
              ref={consentRef}
              className="ug-check__input"
              type="checkbox"
              name="consent"
              required
              checked={consent}
              aria-disabled={busy || undefined}
              aria-invalid={consentError ? true : undefined}
              aria-describedby={consentError ? `${titleId}-consent-error` : undefined}
              onChange={(event) => {
                if (busy) return;
                setConsent(event.target.checked);
                if (consentError) onEdit();
              }}
            />
            <span className="ug-check__box">
              <IconCheck />
            </span>
            <span>
              Email me once when the new version is live. I can unsubscribe at any time. See the{" "}
              <Link href="/legal/privacy">privacy policy</Link>.
            </span>
          </label>
          {consentError ? (
            <p id={`${titleId}-consent-error`} className="ug-error">
              <IconAlert />
              <span>{consentError}</span>
            </p>
          ) : null}
        </div>
        {/* People never see or reach this; bots fill it in, and the server then stores nothing. */}
        <div className="ug-honeypot" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
        </div>
        {/* Busy keeps focus, so it is marked disabled rather than made disabled. */}
        <button
          type="submit"
          className="ug-btn ug-btn--primary ug-btn--block"
          aria-disabled={busy || undefined}
        >
          <span className="ug-btn__label">{busy ? "Sending" : "Notify me"}</span>
          <span className="ug-btn__ic">{busy ? <span className="ug-spinner" /> : <Bell />}</span>
        </button>
      </form>
    </>
  );
}
