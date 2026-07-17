"use client";
import { useEffect, useRef, useState } from "react";
import { Chat, Dots, Moon, Sun } from "@/components/primitives/icons";
import { EASE } from "@/components/primitives/Reveal";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";
type NavProps = Readonly<{
  onOpenMenu: () => void;
}>;
type Tone = "dark" | "light" | null;

function useBackdropTone(ref: React.RefObject<HTMLElement | null>): Tone {
  const [tone, setTone] = useState<Tone>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof document.elementsFromPoint !== "function") return;
    let raf = 0;
    const sample = (): void => {
      const box = el.getBoundingClientRect();
      if (box.width === 0) return;
      const stack = document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      for (const node of stack) {
        if (el.contains(node) || node.closest(".nav")) continue;
        const parts = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
        if (!parts || parts.length < 3) continue;
        if (parts.length > 3 && Number(parts[3]) < 0.5) continue;
        const lum =
          (0.2126 * Number(parts[0]) + 0.7152 * Number(parts[1]) + 0.0722 * Number(parts[2])) / 255;
        setTone(lum < 0.5 ? "dark" : "light");
        return;
      }
      setTone(null);
    };
    const schedule = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sample);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref]);
  return tone;
}

export function Nav({ onOpenMenu }: NavProps): React.ReactElement {
  const { theme, toggle } = useTheme();
  const brandRef = useRef<HTMLAnchorElement>(null);
  const tone = useBackdropTone(brandRef);
  return (
    <motion.nav
      className={`nav${tone ? ` nav--on-${tone}` : ""}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
    >
      <div className="wrap nav-in">
        <a href="#top" className="brand" ref={brandRef}>
          mzwakhe<span className="d">.</span>
        </a>
        <div className="pills">
          <button type="button" className="tbtn" aria-label="Toggle theme" onClick={toggle}>
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
