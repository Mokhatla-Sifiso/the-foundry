import type { Metadata } from "next";
import { UpgradesGate } from "@/components/upgrades/UpgradesGate";

export const metadata: Metadata = {
  title: "Upgrades in progress",
};

/** The upgrades gate (spec UG FR-UG-04). Default export: Next requires it for pages. */
export default function UpgradesPage(): React.ReactElement {
  return <UpgradesGate />;
}
