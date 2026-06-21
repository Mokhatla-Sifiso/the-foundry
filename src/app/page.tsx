import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Statement } from "@/components/sections/Statement";

export default function HomePage(): React.ReactElement {
  return (
    <main className="relative flex flex-col">
      <Hero />
      <Statement />
      <Services />
    </main>
  );
}
