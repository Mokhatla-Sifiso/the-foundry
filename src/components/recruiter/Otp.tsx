"use client";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Arrow } from "@/components/primitives/icons";
import { Dots } from "./Dots";
const OTP_LENGTH = 6;
type OtpProps = Readonly<{
  email: string;
  onVerify: (entered: string) => void;
  error?: string;
  onResend: () => void;
}>;
export function Otp({ email, onVerify, error, onResend }: OtpProps): React.ReactElement {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  const setAt = (i: number, value: string): void => {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };
  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length === 0) {
      setAt(i, "");
      return;
    }
    if (raw.length === 1) {
      setAt(i, raw);
      const nextIndex = Math.min(i + 1, OTP_LENGTH - 1);
      refs.current[nextIndex]?.focus();
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      for (let k = 0; k < OTP_LENGTH - i && k < raw.length; k += 1) {
        next[i + k] = raw[k];
      }
      return next;
    });
    const last = Math.min(i + raw.length, OTP_LENGTH) - 1;
    refs.current[Math.max(last, 0)]?.focus();
  };
  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && digits[i] === "" && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };
  const joined = digits.join("");
  const allFilled = joined.length === OTP_LENGTH;
  const handleVerify = (): void => onVerify(joined);
  return (
    <>
      <Dots step={1} />
      <h1 className="t">Check your inbox</h1>
      <p className="sub">
        Enter the 6-digit code sent to <b>{email}</b> to confirm it&apos;s yours.
      </p>

      <div className="otp" aria-label="Verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            aria-invalid={Boolean(error)}
          />
        ))}
      </div>

      {error ? (
        <div className="err" style={{ color: "var(--warn)", fontSize: 13, marginTop: 4 }}>
          {error}
        </div>
      ) : null}

      <button
        type="button"
        className="btn btn-primary"
        disabled={!allFilled}
        onClick={handleVerify}
        style={{ marginTop: 18 }}
      >
        Verify email
        <Arrow />
      </button>

      <div className="note">
        <span className="b">Heads up</span>
        <div>
          The code lands in your inbox within a few seconds and expires in 5 minutes. Didn&apos;t
          get it?{" "}
          <a
            role="button"
            tabIndex={0}
            onClick={onResend}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onResend();
            }}
            style={{ color: "var(--candy)", fontWeight: 700 }}
          >
            Resend
          </a>
        </div>
      </div>
    </>
  );
}
