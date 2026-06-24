import Link from "next/link";
import "./legal.css";
type LegalLayoutProps = Readonly<{
  title: string;
  version: string;
  updatedAt: string;
  children: React.ReactNode;
}>;
export function LegalLayout({
  title,
  version,
  updatedAt,
  children,
}: LegalLayoutProps): React.ReactElement {
  return (
    <main className="legal">
      <header className="legal-head">
        <Link href="/" className="legal-back">
          ← Back to site
        </Link>
        <h1>{title}</h1>
        <p className="legal-meta">
          Version <code>{version}</code> · last updated {updatedAt}
        </p>
      </header>

      <div className="legal-callout" role="note">
        <strong>Note:</strong> this document is provided in good faith to describe how the site
        actually behaves. It is not legal advice. If you depend on it for regulatory compliance,
        have qualified counsel review it for your jurisdiction.
      </div>

      <article className="legal-body">{children}</article>

      <nav className="legal-nav" aria-label="Legal documents">
        <Link href="/legal/privacy">Privacy</Link>
        <Link href="/legal/cookies">Cookies</Link>
        <Link href="/legal/terms">Terms</Link>
      </nav>
    </main>
  );
}
