"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Close } from "@/components/primitives/icons";
import { useNotifySignup } from "@/hooks/useNotifySignup";
import { NotifyDone } from "./NotifyDone";
import { NotifyForm } from "./NotifyForm";
import "./dialog.css";

export interface NotifyDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotifyDialog({ open, onClose }: NotifyDialogProps): React.ReactElement {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState(0);
  const signup = useNotifySignup();

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      opener.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      el.showModal();
      emailInput.current?.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = (): void => dialog.current?.close();
  const handleClose = (): void => {
    signup.reset();
    setSession((n) => n + 1);
    opener.current?.focus();
    onClose();
  };

  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  return (
    <dialog
      ref={dialog}
      className="ug-dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClose={handleClose}
    >
      <button type="button" className="ug-close" aria-label="Close" onClick={close}>
        <Close />
      </button>
      {signup.state.status === "submitted" ? (
        <NotifyDone titleId={titleId} descId={descId} email={signup.state.email} onDone={close} />
      ) : (
        <NotifyForm
          key={session}
          titleId={titleId}
          descId={descId}
          state={signup.state}
          onSubmit={(input) => void signup.submit(input)}
          onEdit={signup.reset}
          emailRef={emailInput}
        />
      )}
    </dialog>
  );
}
