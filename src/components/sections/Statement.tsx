import { Reveal } from "@/components/primitives/Reveal";

export function Statement(): React.ReactElement {
  return (
    <section id="about" className="sec">
      <div className="wrap">
        <Reveal as="span" className="eyebrow">
          About
        </Reveal>
        <Reveal delay={0.05} className="statement">
          <p>
            I&apos;m a full-stack engineer focused on turning your vision into{" "}
            <span className="em">production-ready</span>{" "}
            <span className="mut">software.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
