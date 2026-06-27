import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { DATA_CONTROLLER, DATA_RETENTION_DAYS, PRIVACY_POLICY_VERSION } from "@/lib/privacy/policy";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Mzwakhe Mokhatla handles personal data on this site.",
};
export default function PrivacyPage(): React.ReactElement {
  return (
    <LegalLayout title="Privacy Policy" version={PRIVACY_POLICY_VERSION} updatedAt="23 June 2026">
      <h2>Who I am</h2>
      <p>
        This site is operated personally by <strong>{DATA_CONTROLLER.name}</strong>, based in{" "}
        {DATA_CONTROLLER.location}. For any privacy question or to exercise the rights described
        below, email <a href={`mailto:${DATA_CONTROLLER.email}`}>{DATA_CONTROLLER.email}</a>.
      </p>

      <h2>What I collect, and why</h2>
      <p>
        I only collect what the recruiter verification flow on <code>/recruiter</code> actually
        needs.
      </p>
      <ul>
        <li>
          <strong>Account details</strong>, your full name, work email, company, role you&apos;re
          hiring for, and a company website / LinkedIn URL. You give this when you request access.
        </li>
        <li>
          <strong>Authentication data</strong>, a one-time code emailed to your inbox, plus a
          session token after verification so you stay signed in.
        </li>
        <li>
          <strong>Technical metadata</strong>, IP address and user-agent of the device that signed
          in, captured for fraud prevention and audit logs.
        </li>
        <li>
          <strong>Consent records</strong>, your cookie choices and policy acceptance, so I can
          prove consent was given (GDPR Article 7).
        </li>
      </ul>
      <p>
        I do <strong>not</strong> sell data, run advertising, or share data with social networks.
        There is no marketing pixel on this site.
      </p>

      <h2>Lawful basis</h2>
      <ul>
        <li>
          <strong>Contract / pre-contract</strong> (GDPR Art. 6(1)(b)), you provide your details to
          take a step toward a hiring conversation.
        </li>
        <li>
          <strong>Legitimate interest</strong> (Art. 6(1)(f)), fraud prevention and audit logs of
          who accessed the CV.
        </li>
        <li>
          <strong>Consent</strong> (Art. 6(1)(a)), non-essential cookies and any future analytics.
        </li>
      </ul>

      <h2>Who processes the data with me</h2>
      <ul>
        <li>
          <strong>Neon</strong> (Postgres database, EU-West-2), stores user records and consent
          logs.
        </li>
        <li>
          <strong>Resend</strong>, delivers the one-time verification code to your inbox.
        </li>
        <li>
          <strong>Vercel</strong>, hosts the site and routes traffic.
        </li>
      </ul>
      <p>
        Each of these is a data processor under a Data Processing Agreement and only handles data on
        documented instructions.
      </p>

      <h2>Retention</h2>
      <p>
        Recruiter accounts are kept for {DATA_RETENTION_DAYS} days from your last sign-in and are
        then either deleted or anonymised, unless you ask me to delete them sooner. Audit logs
        (sign-ins, consent events) are kept for 24 months for security and legal reasons, then
        deleted.
      </p>

      <h2>Your rights</h2>
      <p>Under GDPR and similar laws (UK GDPR, POPIA, CCPA), you have the right to:</p>
      <ul>
        <li>
          <strong>Access</strong>, export everything I hold about you as JSON via{" "}
          <code>/recruiter</code> → &ldquo;Export my data&rdquo;.
        </li>
        <li>
          <strong>Rectification</strong>, update your name, company, role, and URL by going through
          sign-up again with the same email.
        </li>
        <li>
          <strong>Erasure</strong>, delete your account and all associated profile data via{" "}
          <code>/recruiter</code> → &ldquo;Delete my account&rdquo;.
        </li>
        <li>
          <strong>Withdraw consent</strong>, reopen the cookie banner at any time from the footer.
        </li>
        <li>
          <strong>Object / restrict</strong>, email me and I&apos;ll comply within 30 days (usually
          within 48 hours).
        </li>
        <li>
          <strong>Lodge a complaint</strong>, with your local supervisory authority (in South
          Africa, the Information Regulator; in the EU, your national DPA).
        </li>
      </ul>

      <h2>International transfers</h2>
      <p>
        Data is processed primarily in the EU (Neon EU-West-2, Resend EU region) and may transit
        through Vercel&apos;s global edge network. Standard contractual clauses (or the equivalent
        transfer mechanism) are in place with each processor.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When this policy changes materially, the version string at the top of the page is bumped and
        you will be asked to re-confirm consent on your next visit.
      </p>
    </LegalLayout>
  );
}
