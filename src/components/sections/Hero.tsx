"use client";
import { Arrow, Chat } from "@/components/primitives/icons";
import { EASE } from "@/components/primitives/Reveal";
import { SITE } from "@/lib/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { HeroPeel } from "./HeroPeel";

type HeroProps = Readonly<{
  underlay: React.ReactNode;
}>;

export function Hero({ underlay }: HeroProps): React.ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yRender = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const yMark = useTransform(scrollYProgress, [0, 1], [0, 80]);
  return (
    <section id="top" className="hero" ref={ref}>
      <motion.div
        className="hero-mark"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
        style={{ y: yMark }}
      >
        mzwakhe
      </motion.div>

      <div className="hero-render-wrap">
        <motion.div
          className="hero-render"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.25 }}
          style={{ y: yRender }}
        >
          <div className="glowpad" />
          <Image
            src={SITE.portrait}
            alt={`Portrait of ${SITE.name}`}
            fill
            priority
            sizes="(min-width: 1280px) 620px, (min-width: 768px) 40vw, 64vw"
            style={{ objectFit: "cover", borderRadius: 26 }}
          />
        </motion.div>
      </div>

      <HeroPeel progress={scrollYProgress}>{underlay}</HeroPeel>

      <div className="wrap hero-foot">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
        >
          <span className="eyebrow">Under construction</span>
          <h1>
            Work in progress. <span className="em">Peel back the page.</span>
          </h1>
          <p className="hero-sub">
            Drag the corner to see the code underneath. The CV and my inbox are still open.
          </p>
          <div className="hero-cta">
            <a href="#recruiters" className="pill pill-dark">
              Download CV
              <span className="ic">
                <Arrow />
              </span>
            </a>
            <a href="#contact" className="pill pill-light">
              Get in touch
              <span className="ic">
                <Chat />
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
