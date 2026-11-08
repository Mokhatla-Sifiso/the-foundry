import type { Metadata } from "next";
import { StatusPage } from "@/components/upgrades/StatusPage";
import { unsubscribeView } from "@/lib/updates/pages";

type Props = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // The URL carries a token, so the page is never indexed.
  return {
    title: unsubscribeView(await searchParams).title,
    robots: { index: false, follow: false },
  };
}

/**
 * Where the email's unsubscribe link lands (spec UG FR-UG-07). Unsubscribing takes the button, so
 * link scanners cannot unsubscribe anyone. Default export: Next needs it.
 */
export default async function UnsubscribePage({
  searchParams,
}: Props): Promise<React.ReactElement> {
  return <StatusPage view={unsubscribeView(await searchParams)} />;
}
