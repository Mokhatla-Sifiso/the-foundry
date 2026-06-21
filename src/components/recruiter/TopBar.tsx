"use client";

import Link from "next/link";
import { IconBack, Moon, Sun } from "@/components/primitives/icons";
import { useTheme } from "@/hooks/useTheme";

/**
 * Recruiter top bar — VERBATIM markup from §10.12. `mzwakhe.` brand
 * linking back to /, the round theme button (Moon when light, Sun
 * when dark), and the `← Back to site` link.
 */
export function TopBar(): React.ReactElement {
  const { theme, toggle } = useTheme();
  return (
    <div className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand">
          mzwakhe<span className="d">.</span>
        </Link>
        <div className="top-actions">
          <button
            type="button"
            className="tbtn"
            aria-label="Toggle theme"
            onClick={toggle}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <Link href="/" className="backlink">
            <IconBack />
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
