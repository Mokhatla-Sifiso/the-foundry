import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";
import { Work } from "@/components/sections/Work";

export default function HomePage(): React.ReactElement {
  return (
    <main className="relative flex flex-col">
      <Hero />
      <Statement />
      <Services />
      <Work />
      <Experience />
    </main>
  );
}
