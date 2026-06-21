"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { NAVLINKS, SITE } from "@/lib/constants";

type MenuProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

const OVERLAY_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fullscreen overlay nav. AnimatePresence handles the mount/unmount
 * transition; Escape closes; clicking a link closes (in-page anchors
 * scroll once the overlay is gone). Item stagger is delay-keyed by
 * index for the prototype's cascading reveal feel.
 */
export function Menu({ open, onClose }: MenuProps): React.ReactElement {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="studio-menu"
          id="studio-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: OVERLAY_EASE }}
          className="fixed inset-0 z-50 flex flex-col bg-onyx text-card-fg"
        >
          <div className="flex items-center justify-between px-6 py-5 sm:px-10">
            <span className="text-sm font-semibold tracking-tight">
              {SITE.shortName} Studio
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-card-fg/20 transition hover:bg-card-fg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          </div>

          <nav
            aria-label="Primary"
            className="flex flex-1 flex-col items-center justify-center px-6 text-center"
          >
            <ul className="flex flex-col items-center gap-6 sm:gap-8">
              {NAVLINKS.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.05 + index * 0.05,
                    ease: OVERLAY_EASE,
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="text-4xl font-semibold tracking-tight transition hover:text-accent sm:text-6xl"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
