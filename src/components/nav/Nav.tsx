"use client";

import { motion } from "framer-motion";
import { Chat, Dots, Moon, Sun } from "@/components/primitives/icons";
import { EASE } from "@/components/primitives/Reveal";
import { useTheme } from "@/hooks/useTheme";

type NavProps = Readonly<{ onOpenMenu: () => void }>;

export function Nav({ onOpenMenu }: NavProps): React.ReactElement {
  const { theme, toggle } = useTheme();

  return (
    <motion.nav
      className="nav"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
    >
      <div className="wrap nav-in">
        <a href="#top" className="brand">
          mzwakhe<span className="d">.</span>
        </a>
        <div className="pills">
          <button
            type="button"
            className="tbtn"
            aria-label="Toggle theme"
            onClick={toggle}
          >
            {theme === "light" ? <Moon /> : <Sun />}
          </button>
          <a href="#contact" className="pill pill-light">
            <span className="t">Let&apos;s talk</span>
            <span className="ic">
              <Chat />
            </span>
          </a>
          <button type="button" className="pill pill-dark" onClick={onOpenMenu}>
            Menu
            <span className="ic">
              <Dots />
            </span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
