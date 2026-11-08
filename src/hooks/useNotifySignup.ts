"use client";
import { useCallback, useRef, useState } from "react";
import { RATE_LIMITED, SERVER_ERROR } from "@/lib/updates/messages";
import { parseSubscribe } from "@/lib/updates/validation";

export { RATE_LIMITED, SERVER_ERROR };

/** The notify dialog's states (spec UG 4.7). */
export type NotifyState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "submitting" }>
  /** Shown the same way for new, pending and confirmed addresses (G8). */
  | Readonly<{ status: "submitted"; email: string }>
  | Readonly<{ status: "invalid"; field: "email" | "consent"; message: string }>
  /** Rate limited or a server error: shown as an alert above the form. */
  | Readonly<{ status: "failed"; message: string }>;

export interface NotifyInput {
  email: string;
  consent: boolean;
  /** The honeypot. People never see it, so it stays empty. */
  website: string;
}

export interface NotifySignup {
  state: NotifyState;
  submit: (input: NotifyInput) => Promise<void>;
  /** Back to idle; a response still in flight is then ignored. */
  reset: () => void;
}

function fieldError(body: unknown): { field: "email" | "consent"; message: string } | null {
  if (!body || typeof body !== "object") return null;
  const { field, message } = body as Record<string, unknown>;
  if ((field !== "email" && field !== "consent") || typeof message !== "string") return null;
  return { field, message };
}

/**
 * The notify sign-up (FR-UG-05). Checks the input with the server's own rules first, so most
 * mistakes are caught without a request, then maps each response of spec 7.1 to a state.
 */
export function useNotifySignup(): NotifySignup {
  const [state, setState] = useState<NotifyState>({ status: "idle" });
  const attempt = useRef(0);

  const submit = useCallback(async (input: NotifyInput): Promise<void> => {
    const checked = parseSubscribe({ ...input });
    if (!checked.ok) {
      setState({ status: "invalid", field: checked.field, message: checked.message });
      return;
    }
    const id = ++attempt.current;
    const settle = (next: NotifyState): void => {
      if (id === attempt.current) setState(next);
    };
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/updates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.status === 202) {
        settle({ status: "submitted", email: "email" in checked ? checked.email : input.email });
        return;
      }
      if (res.status === 429) {
        settle({ status: "failed", message: RATE_LIMITED });
        return;
      }
      const invalid = res.status === 400 ? fieldError(await res.json().catch(() => null)) : null;
      settle(
        invalid ? { status: "invalid", ...invalid } : { status: "failed", message: SERVER_ERROR },
      );
    } catch {
      settle({ status: "failed", message: SERVER_ERROR });
    }
  }, []);

  const reset = useCallback((): void => {
    attempt.current++;
    setState({ status: "idle" });
  }, []);

  return { state, submit, reset };
}
