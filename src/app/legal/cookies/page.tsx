import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { CATEGORY_META, CATEGORY_ORDER, inventoryByCategory } from "@/lib/privacy/cookies";
import { COOKIE_POLICY_VERSION } from "@/lib/privacy/policy";
export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Every cookie and storage key this site sets, what it does, and how long it lives.",
};
export default function CookiePage(): React.ReactElement {
  return (
    <LegalLayout title="Cookie Policy" version={COOKIE_POLICY_VERSION} updatedAt="16 July 2026">
      <h2>About this list</h2>
      <p>
        Every cookie and browser-storage key this site sets is listed below. The list is rendered
        directly from the same inventory the consent banner uses, so the policy cannot drift from
        reality. If you find something on your machine that isn&apos;t in the table, it isn&apos;t
        from us.
      </p>

      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const rows = inventoryByCategory(cat);
        return (
          <section key={cat}>
            <h2>{meta.label}</h2>
            <p>{meta.description}</p>
            {rows.length === 0 ? (
              <p>
                <em>None currently set.</em>
              </p>
            ) : (
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Where</th>
                    <th>Set by</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.name}>
                      <td>
                        <code>{c.name}</code>
                      </td>
                      <td>{c.storage}</td>
                      <td>{c.party === "first" ? "this site" : "third party"}</td>
                      <td>{c.purpose}</td>
                      <td>{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}

      <h2>Changing your mind</h2>
      <p>
        Click <strong>&ldquo;Cookie preferences&rdquo;</strong>{" "}
        in the footer at any time to reopen the consent banner. Withdrawing consent does not
        retroactively erase data we already had your permission to process &mdash; see the{" "}
        <a href="/legal/privacy">Privacy Policy</a> for that.
      </p>
    </LegalLayout>
  );
}
