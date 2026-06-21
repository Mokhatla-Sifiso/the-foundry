"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/primitives/Reveal";
import { IconCheck, IconDown } from "@/components/primitives/icons";
import { Dots } from "./Dots";
import { SITE } from "@/lib/constants";
import type { RecruiterAccount } from "@/lib/recruiter";

type ApprovedProps = Readonly<{
  account: RecruiterAccount;
  onSignOut: () => void;
}>;

export function Approved({ account, onSignOut }: ApprovedProps): React.ReactElement {
  const firstName = account.name.split(" ")[0];
  const fileName = SITE.cvHref.split("/").pop() ?? "Mzwakhe-Mokhatla-CV.pdf";

  return (
    <>
      <Dots step={3} />
      <motion.div
        className="seal"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        aria-hidden="true"
      >
        <IconCheck />
      </motion.div>
      <h1 className="t" style={{ textAlign: "center" }}>
        You&apos;re verified.
      </h1>
      <p className="sub" style={{ textAlign: "center", margin: "0 auto 22px" }}>
        Thanks, {firstName}. The full CV is unlocked for you on this device.
      </p>

      <div className="who">
        <span className="nm">{account.name}</span>
        <span className="meta">
          {account.role} · {account.company}
        </span>
        <span className="meta">{account.email}</span>
        <span className="badge">
          <IconCheck />
          Verified recruiter
        </span>
      </div>

      <a className="dl" href={SITE.cvHref} download={fileName}>
        Download CV (PDF)
        <IconDown />
      </a>

      <div style={{ textAlign: "center" }}>
        <button type="button" className="signout" onClick={onSignOut}>
          Not you? Sign out
        </button>
      </div>
    </>
  );
}
