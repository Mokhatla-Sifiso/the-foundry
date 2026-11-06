"use client";
import Link from "next/link";
import { IconBack } from "@/components/primitives/icons";
import { ThemeToggle } from "@/components/primitives/ThemeToggle";
export function TopBar(): React.ReactElement {
  return (
    <div className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand">
          mzwakhe<span className="d">.</span>
        </Link>
        <div className="top-actions">
          <ThemeToggle />
          <Link href="/" className="backlink">
            <IconBack />
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
