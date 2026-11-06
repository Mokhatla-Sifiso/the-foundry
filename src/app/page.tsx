import { NavMenu } from "@/components/nav/NavMenu";
import { Progress } from "@/components/primitives/Progress";
import { SmoothScroll } from "@/components/primitives/SmoothScroll";
import { AISection } from "@/components/sections/AISection";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Recruiters } from "@/components/sections/Recruiters";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { TransContinental } from "@/components/sections/TransContinental";
import { Work } from "@/components/sections/Work";
import { WorkflowPlan } from "@/components/sections/WorkflowPlan";
export default function HomePage(): React.ReactElement {
  return (
    <SmoothScroll>
      <Progress />
      <NavMenu />
      <main>
        <Hero />
        <Statement />
        <Services />
        <WorkflowPlan />
        <Work />
        <Experience />
        <TransContinental />
        <AISection />
        <Recruiters />
        <Contact />
        <Faq />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
