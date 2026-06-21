import { NavMenu } from "@/components/nav/NavMenu";
import { Progress } from "@/components/primitives/Progress";
import { AISection } from "@/components/sections/AISection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { Work } from "@/components/sections/Work";

/**
 * Render order is VERBATIM from §1:
 *   Progress → Nav → Menu → <main>[Hero, Statement, Services, Work,
 *   Experience, AISection, Contact] → Footer.
 *
 * Nav + Menu come from a single client `<NavMenu>` so the open/close
 * state lives in one place without lifting it into this server layout.
 */
export default function HomePage(): React.ReactElement {
  return (
    <>
      <Progress />
      <NavMenu />
      <main>
        <Hero />
        <Statement />
        <Services />
        <Work />
        <Experience />
        <AISection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
