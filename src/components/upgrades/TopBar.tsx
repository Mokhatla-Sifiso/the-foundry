"use client";
import Link from "next/link";
import type { Ref } from "react";
import { ThemeToggle } from "@/components/primitives/ThemeToggle";

export interface TopBarProps {
  ref?: Ref<HTMLElement>;
}

/** The gate's top bar: the brand and the theme toggle only (spec UG D3). */
export function TopBar({ ref }: TopBarProps): React.ReactElement {
  return (
    <header ref={ref} className="ug-bar">
      {/* No prefetch: prefetches skip the proxy, so one would fetch the gated home page. */}
      <Link href="/" className="brand" prefetch={false}>
        mzwakhe<span className="d">.</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
