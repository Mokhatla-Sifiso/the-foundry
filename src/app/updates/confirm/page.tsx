import type { Metadata } from "next";
import { StatusPage } from "@/components/upgrades/StatusPage";
import { confirmView } from "@/lib/updates/pages";

type Props = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // The URL carries a token, so the page is never indexed.
  return { title: confirmView(await searchParams).title, robots: { index: false, follow: false } };
}

/**
 * Where the confirmation email's link lands (spec UG FR-UG-06). Confirming takes the button, not
 * the link, so mail scanners that open links cannot confirm anyone. Default export: Next needs it.
 */
export default async function ConfirmPage({ searchParams }: Props): Promise<React.ReactElement> {
  return <StatusPage view={confirmView(await searchParams)} />;
}
