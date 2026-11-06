import type { Metadata } from "next";
import { UpgradesGate } from "@/components/upgrades/UpgradesGate";

export const metadata: Metadata = {
  title: "Upgrades in progress",
};

export default function UpgradesPage(): React.ReactElement {
  return <UpgradesGate />;
}
