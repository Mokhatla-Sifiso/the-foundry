"use client";

import { useCallback, useState } from "react";
import { Menu } from "./Menu";
import { Nav } from "./Nav";

export function NavBar(): React.ReactElement {
  const [menuOpen, setMenuOpen] = useState(false);

  const open = useCallback((): void => setMenuOpen(true), []);
  const close = useCallback((): void => setMenuOpen(false), []);

  return (
    <>
      <Nav onMenuOpen={open} menuOpen={menuOpen} />
      <Menu open={menuOpen} onClose={close} />
    </>
  );
}
