import type { Metadata } from "next";
import { headers } from "next/headers";
import { UpgradesGate } from "@/components/upgrades/UpgradesGate";
import { RETURN_HEADER, safeReturnPath } from "@/lib/gate/access";

export const metadata: Metadata = {
  title: "Upgrades in progress",
};

/**
 * The upgrades gate (spec UG FR-UG-04). The proxy shows it in place of any page the visitor
 * has no access to yet, and passes that page along so the way through returns to it.
 * Default export: Next requires it for pages.
 */
export default async function UpgradesPage(): Promise<React.ReactElement> {
  const returnPath = safeReturnPath((await headers()).get(RETURN_HEADER) ?? "/");
  return <UpgradesGate returnPath={returnPath} />;
}
