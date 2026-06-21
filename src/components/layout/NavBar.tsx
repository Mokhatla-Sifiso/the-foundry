"use client";

import { useCallback, useState } from "react";
import { Menu } from "./Menu";
import { Nav } from "./Nav";

/**
 * Composes the sticky pill `<Nav>` with the fullscreen `<Menu>` overlay
 * so the menu open-state can be owned in one place. The layout renders
 * `<NavBar />` once near the top of `<body>` — sections never touch it.
 */
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
