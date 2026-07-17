"use client";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/primitives/Reveal";
import { IconLock } from "@/components/primitives/icons";
import { SITE } from "@/lib/constants";

type Tier = Readonly<{
  key: string;
  path: string;
  tier: string;
  audience: string;
  desc: string;
  unlocks: ReadonlyArray<string>;
}>;

const TIERS: ReadonlyArray<Tier> = [
  {
    key: "silver",
    path: "/guest",
    tier: "Silver",
    audience: "Guests",
    desc: "Request access to what you need.",
    unlocks: ["The CV and resources, on request", "Approved by me", "A 24-hour access window"],
  },
  {
    key: "platinum",
    path: "/recruiter",
    tier: "Platinum",
    audience: "Recruiter",
    desc: "For recruitment and screening.",
    unlocks: ["Full CV & verified profile", "References", "Availability & preferences"],
  },
  {
    key: "black",
    path: "/executive",
    tier: "Black",
    audience: "Leads & Executives",
    desc: "Book a demo, request repo access.",
    unlocks: ["Book a live demo", "Request repo access", "A direct executive line"],
  },
];

export function Recruiters(): React.ReactElement {
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridSeen, setGridSeen] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (typeof IntersectionObserver === "undefined") {
      const raf = window.requestAnimationFrame(() => setGridSeen(true));
      return () => window.cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    io.observe(grid);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".pass"));
    const frames = new Map<HTMLElement, number>();
    const move = (el: HTMLElement, e: PointerEvent): void => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      if (frames.get(el)) return;
      frames.set(
        el,
        requestAnimationFrame(() => {
          frames.set(el, 0);
          el.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
          el.style.setProperty("--ry", `${(px - 0.5) * 11}deg`);
          el.style.setProperty("--mx", `${px * 100}%`);
          el.style.setProperty("--my", `${py * 100}%`);
        }),
      );
    };
    const leave = (el: HTMLElement): void => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "0%");
    };
    const cleanups = cards.map((el) => {
      const onMove = (e: PointerEvent): void => move(el, e);
      const onLeave = (): void => leave(el);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });
    return () => {
      cleanups.forEach((fn) => fn());
      frames.forEach((id) => id && cancelAnimationFrame(id));
    };
  }, []);

  return (
    <section id="recruiters" className="sec recruiters">
      <div className="wrap rec-wrap">
        <Reveal className="rec-rule">
          <span>Priority access</span>
          <span>By verification</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="rec-h">
            Which brings <span className="em">you here?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="rec-lead">
            Three ways in. Verify once with a work email, and the materials that fit unlock, for how
            we would actually work together.
          </p>
        </Reveal>

        <div ref={gridRef} className={`rec-tiers${gridSeen ? " rec-tiers--in" : ""}`}>
          {TIERS.map((t) => (
            <a
              key={t.key}
              className={`pass pass--${t.key}`}
              href={t.path}
              aria-label={`${t.audience}: ${t.desc}`}
            >
                <span className="pass-sheen" aria-hidden="true" />
                <div className="pass-head">
                  <span className="pass-kicker">{t.tier}</span>
                  <span className="pass-chip">
                    <IconLock />
                    Locked
                  </span>
                </div>
                <div className="pass-holder">
                  <span className="pass-ey">Access tier</span>
                  <span className="pass-name">{t.audience}</span>
                  <span className="pass-role">{t.desc}</span>
                </div>
                <ul className="pass-unlocks">
                  {t.unlocks.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
                <div className="pass-foot">
                  <span className="pass-issued">Issued to · —</span>
                  <span className="pass-go">
                    Get access <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
            </a>
          ))}
        </div>

        <Reveal delay={0.24}>
          <a className="rec-textlink" href={`mailto:${SITE.email}`}>
            Not sure which? Just write to me.
          </a>
        </Reveal>
      </div>
    </section>
  );
}
