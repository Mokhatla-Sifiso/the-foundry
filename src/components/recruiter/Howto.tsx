/**
 * Verification disclosure — VERBATIM copy from §10.11. Closed by
 * default; opens to reveal the four-step explainer.
 */
export function Howto(): React.ReactElement {
  return (
    <details className="howto">
      <summary>
        <span className="pl">＋</span> How verification works
      </summary>
      <ol>
        <li>
          <b>Work email.</b> Personal inboxes are blocked — a company domain
          ties you to your organisation.
        </li>
        <li>
          <b>Email code.</b> A 6-digit code confirms you actually control that
          inbox.
        </li>
        <li>
          <b>Quick screen.</b> Your company, role and link are reviewed for a
          genuine hiring intent.
        </li>
        <li>
          <b>Access on file.</b> You can sign back in anytime to re-download —
          no re-verifying.
        </li>
      </ol>
      <p style={{ marginTop: 14, fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
        This is a front-end prototype: the code is shown on screen instead of
        emailed, and access is stored on your device. A production version
        adds server-side email delivery, expiring download links, and session
        security.
      </p>
    </details>
  );
}
