import type { Metadata } from "next";
import { headers } from "next/headers";
import { UpgradesGate } from "@/components/upgrades/UpgradesGate";
import { RETURN_HEADER, safeReturnPath } from "@/lib/gate/access";

export const metadata: Metadata = {
  title: "Upgrades in progress",
};

export default async function UpgradesPage(): Promise<React.ReactElement> {
  const returnPath = safeReturnPath((await headers()).get(RETURN_HEADER) ?? "/");
  return <UpgradesGate returnPath={returnPath} />;
}
