import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { DATA_CONTROLLER, TERMS_VERSION } from "@/lib/privacy/policy";
export const metadata: Metadata = {
  title: "Recruiter Terms",
  description: "What you agree to when you request access to download the CV.",
};
export default function TermsPage(): React.ReactElement {
  return (
    <LegalLayout title="Recruiter Terms" version={TERMS_VERSION} updatedAt="23 June 2026">
      <h2>1. Who these terms apply to</h2>
      <p>
        These terms apply when you request access to <code>/recruiter</code> in order to download{" "}
        {DATA_CONTROLLER.name}&apos;s CV or related professional materials.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>You confirm that the company, role, and contact details you provide are accurate.</li>
        <li>
          You agree to use the materials you download solely to evaluate a potential professional
          engagement with {DATA_CONTROLLER.name}.
        </li>
        <li>
          You will not republish, post on job boards, sell, or otherwise distribute the CV without
          written permission.
        </li>
      </ul>

      <h2>3. Account responsibility</h2>
      <p>
        The work email you sign up with is the key to your account. Don&apos;t share access. If you
        suspect someone else has used your email, email{" "}
        <a href={`mailto:${DATA_CONTROLLER.email}`}>{DATA_CONTROLLER.email}</a>.
      </p>

      <h2>4. Intellectual property</h2>
      <p>
        All CV content, writing, code samples, and visual assets on this site remain the property of{" "}
        {DATA_CONTROLLER.name}. Verified access does not transfer ownership.
      </p>

      <h2>5. Limitation of liability</h2>
      <p>
        This site is provided as-is. To the extent permitted by law, {DATA_CONTROLLER.name} is not
        liable for any indirect or consequential loss arising from your use of the site or the
        materials downloaded from it.
      </p>

      <h2>6. Termination</h2>
      <p>
        I may suspend or revoke your access at any time if I believe these terms have been breached.
        You can terminate your own account at any time via <code>/recruiter</code> → &ldquo;Delete
        my account&rdquo;.
      </p>

      <h2>7. Governing law</h2>
      <p>
        These terms are governed by the laws of {DATA_CONTROLLER.location}. Any disputes will be
        resolved in the appropriate courts there, unless mandatory consumer-protection law in your
        country gives you the right to use a local forum.
      </p>

      <h2>8. Changes</h2>
      <p>
        When these terms change materially, the version string at the top of this page is bumped and
        you&apos;ll be asked to re-accept on your next sign-in.
      </p>
    </LegalLayout>
  );
}
