"use client";
import Link from "next/link";
import { IconBack, Moon, Sun } from "@/components/primitives/icons";
import { useTheme } from "@/hooks/useTheme";
export function TopBar(): React.ReactElement {
  const { theme, toggle } = useTheme();
  return (
    <div className="topbar">
      <div className="topbar-in">
        <Link href="/" className="brand">
          mzwakhe<span className="d">.</span>
        </Link>
        <div className="top-actions">
          <button type="button" className="tbtn" aria-label="Toggle theme" onClick={toggle}>
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
