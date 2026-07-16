import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Onest } from "next/font/google";
import { Loader } from "@/components/Loader";
import { ThemeScript } from "@/components/ThemeScript";
import { Toaster } from "@/components/primitives/Toaster";
import { ConsentProvider } from "@/components/privacy/ConsentProvider";
import { ConsentBanner } from "@/components/privacy/ConsentBanner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const TITLE = `${SITE.name}, Software Engineer`;
const DESCRIPTION =
  "Mzwakhe Mokhatla, a full-stack software engineer and acting Technical Lead in South Africa, turning ideas into digital realities through production-grade React, Next.js, TypeScript, NestJS, and Azure-native systems for telecoms, fintech, and consulting clients.";
const KEYWORDS = [
  "Mzwakhe Mokhatla",
  "Software Engineer",
  "Full-Stack Engineer",
  "Tech Lead",
  "React",
  "Next.js",
  "TypeScript",
  "NestJS",
  "Azure",
  "Microfrontends",
  "Pretoria",
  "South Africa",
  "Portfolio",
  "MTN",
  "Accenture",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${SITE.name}` },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_ZA",
    images: [
      {
        url: SITE.portrait,
        width: 1200,
        height: 630,
        alt: `Portrait of ${SITE.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SITE.portrait],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    apple: SITE.portrait,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9f1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#020202" },
  ],
  width: "device-width",
  initialScale: 1,
};

function StructuredData({ nonce }: { nonce?: string }): React.ReactElement {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE_URL,
    image: `${SITE_URL}${SITE.portrait}`,
    email: SITE.email,
    telephone: SITE.phoneHref.replace("tel:", ""),
    jobTitle: "Software Engineer · Full-Stack · Tech Lead",
    description: DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pretoria",
      addressCountry: "South Africa",
    },
    worksFor: [
      { "@type": "Organization", name: "MTN Group" },
      { "@type": "Organization", name: "Accenture" },
    ],
    knowsAbout: [
      "TypeScript",
      "React",
      "Next.js",
      "NestJS",
      "Azure",
      "Microfrontends",
      "DevOps",
      "PostgreSQL",
    ],
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name },
  };
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.ReactElement> {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className={onest.variable} suppressHydrationWarning>
      <head>
        <ThemeScript nonce={nonce} />
        <StructuredData nonce={nonce} />
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
        <ConsentProvider>
          {children}
          <ConsentBanner />
          <GoogleAnalytics nonce={nonce} />
        </ConsentProvider>
        <Toaster />
      </body>
    </html>
  );
}
