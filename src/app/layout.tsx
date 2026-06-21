import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Loader } from "@/components/Loader";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mzwakhe.dev"),
  title: {
    default: "Mzwakhe Mokhatla — Software Engineer",
    template: "%s · Mzwakhe Mokhatla",
  },
  description:
    "Software Engineer · Full-Stack · Tech Lead. Turning ideas into digital realities.",
  openGraph: {
    title: "Mzwakhe Mokhatla — Software Engineer",
    description: "Turning ideas into digital realities.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

/**
 * Root layout. Order (per §1):
 *   1. ThemeScript in <head> — sets data-theme before paint.
 *   2. #loader markup at the very top of <body> — static HTML so it
 *      paints on the first chunk, before React hydrates.
 *   3. <Loader /> client controller — runs the 600ms / 1400ms timers
 *      that fade and remove the overlay.
 *   4. {children} — page content.
 */
export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" className={onest.variable}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <div id="loader">
          <div className="ld-ring" />
          <div className="ld-brand">
            mzwakhe<span>.</span>
          </div>
          <div className="ld-sub">Loading experience</div>
        </div>
        <Loader />
        {children}
      </body>
    </html>
  );
}
