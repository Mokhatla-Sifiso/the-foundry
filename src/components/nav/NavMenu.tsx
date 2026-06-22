"use client";

import { useCallback, useState } from "react";
import { Menu } from "./Menu";
import { Nav } from "./Nav";

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
