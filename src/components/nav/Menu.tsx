"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Close } from "@/components/primitives/icons";
import { EASE } from "@/components/primitives/Reveal";
import { useTheme } from "@/hooks/useTheme";
import { NAVLINKS, SITE } from "@/lib/constants";

type MenuProps = Readonly<{ open: boolean; onClose: () => void }>;

export function Menu({ open, onClose }: MenuProps): React.ReactElement {
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const themeText = theme === "dark" ? "Light mode" : "Dark mode";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="menu-top">
            <a href="#top" className="brand" onClick={onClose}>
              mzwakhe<span className="d">.</span>
            </a>
            <button
              type="button"
              className="closeb"
              aria-label="Close menu"
              onClick={onClose}
            >
              <Close />
            </button>
          </div>

          <nav className="menu-links" aria-label="Primary">
            {NAVLINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={onClose}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }}
              >
                <span className="n">{link.n}</span>
                {link.t}
              </motion.a>
            ))}
          </nav>

          <div className="menu-foot">
            <a href="/recruiter" onClick={onClose}>
              Download CV
            </a>
            <a href={`mailto:${SITE.email}`} onClick={onClose}>
              {SITE.email}
            </a>
            <a href={SITE.phoneHref} onClick={onClose}>
              {SITE.phone}
            </a>
            <a
              role="button"
              onClick={() => {
                toggle();
              }}
            >
              {themeText}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
