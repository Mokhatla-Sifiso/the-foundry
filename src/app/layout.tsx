import type { Metadata } from "next";
import { Onest } from "next/font/google";
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
    default: "Mzwakhe Mokhatla — Studio",
    template: "%s · Mzwakhe Mokhatla",
  },
  description:
    "Software engineer & co-founder. Microfrontend specialist building AI-centric products.",
  openGraph: {
    title: "Mzwakhe Mokhatla — Studio",
    description:
      "Software engineer & co-founder. Microfrontend specialist building AI-centric products.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" data-theme="light" className={onest.variable}>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
