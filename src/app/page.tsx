import { NavMenu } from "@/components/nav/NavMenu";
import { Progress } from "@/components/primitives/Progress";
import { SmoothScroll } from "@/components/primitives/SmoothScroll";
import { AISection } from "@/components/sections/AISection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { TransContinental } from "@/components/sections/TransContinental";
import { Work } from "@/components/sections/Work";
export default function HomePage(): React.ReactElement {
  return (
    <SmoothScroll>
      <Progress />
      <NavMenu />
      <main>
        <Hero />
        <Statement />
        <Services />
        <Work />
        <Experience />
        <TransContinental />
        <AISection />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
