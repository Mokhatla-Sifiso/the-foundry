"use client";
import { Arrow, IconLock } from "@/components/primitives/icons";
import { Howto } from "./Howto";
type GateProps = Readonly<{
  onRequestAccess: () => void;
  onHaveAccess: () => void;
}>;
export function Gate({ onRequestAccess, onHaveAccess }: GateProps): React.ReactElement {
  return (
    <>
      <span className="eyebrow">
        <span className="lock">
          <IconLock />
        </span>
        Verified recruiter access
      </span>
      <h1 className="t">
        Download my CV, <span className="em">for verified recruiters.</span>
      </h1>
      <p className="sub">
        To keep my details with people who are actually hiring, the full CV sits behind a quick
        verification. Takes about a minute with your work email.
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <button type="button" className="btn btn-primary" onClick={onRequestAccess}>
          Request access
          <Arrow />
        </button>
        <button type="button" className="btn btn-ghost" onClick={onHaveAccess}>
          I already have access
        </button>
      </div>

      <Howto />
    </>
  );
}
