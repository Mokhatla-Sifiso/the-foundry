"use client";
import { useEffect, useRef } from "react";
import { IconCheck, IconMail } from "@/components/primitives/icons";
import "./buttons.css";

export interface NotifyDoneProps {
  titleId: string;
  descId: string;
  /** The address as stored. */
  email: string;
  onDone: () => void;
}

/**
 * The notify dialog after a sign-up (spec UG G8). The words are the same whether the address is
 * new, pending or already confirmed, so nobody can test who is on the list.
 */
export function NotifyDone({
  titleId,
  descId,
  email,
  onDone,
}: NotifyDoneProps): React.ReactElement {
  const heading = useRef<HTMLHeadingElement>(null);
  // Focus moves to the heading, so a screen reader announces the confirmation.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <>
      <span className="ug-success">
        <IconMail />
      </span>
      <h2 id={titleId} ref={heading} tabIndex={-1}>
        Check your inbox
      </h2>
      <p id={descId} className="ug-dialog__desc">
        If this address still needs confirming, a link is on its way to <strong>{email}</strong>. It
        expires in 48 hours.
      </p>
      <button type="button" className="ug-btn ug-btn--secondary ug-btn--block" onClick={onDone}>
        <span className="ug-btn__label">Done</span>
        <span className="ug-btn__ic">
          <IconCheck />
        </span>
      </button>
    </>
  );
}
