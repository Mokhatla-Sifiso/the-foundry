"use client";

import { useCallback, useState } from "react";
import { Menu } from "./Menu";
import { Nav } from "./Nav";

/**
 * Owns the menu-open state and renders `<Nav>` + `<Menu>` as siblings
 * so both can read/write the same flag without lifting state into the
 * layout (which is a server component).
 */
export function NavMenu(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const onOpenMenu = useCallback((): void => setOpen(true), []);
  const onClose = useCallback((): void => setOpen(false), []);

  return (
    <>
      <Nav onOpenMenu={onOpenMenu} />
      <Menu open={open} onClose={onClose} />
    </>
  );
}
