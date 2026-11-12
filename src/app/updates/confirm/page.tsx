import type { Metadata } from "next";
import { StatusPage } from "@/components/upgrades/StatusPage";
import { confirmView } from "@/lib/updates/pages";

type Props = Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return { title: confirmView(await searchParams).title, robots: { index: false, follow: false } };
}

export default async function ConfirmPage({ searchParams }: Props): Promise<React.ReactElement> {
  return <StatusPage view={confirmView(await searchParams)} />;
}
