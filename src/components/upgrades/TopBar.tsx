"use client";
import Link from "next/link";
import type { Ref } from "react";
import { ThemeToggle } from "@/components/primitives/ThemeToggle";

export interface TopBarProps {
  ref?: Ref<HTMLElement>;
}

export function TopBar({ ref }: TopBarProps): React.ReactElement {
  return (
    <header ref={ref} className="ug-bar">
      <Link href="/" className="brand" prefetch={false}>
        mzwakhe<span className="d">.</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
