import Image from "next/image";
import { SITE } from "@/lib/constants";

export function HeroPortrait(): React.ReactElement {
  if (!SITE.portrait) {
    return (
      <div
        role="img"
        aria-label={`${SITE.name} portrait placeholder`}
        data-testid="hero-portrait-placeholder"
        className="h-full w-full bg-gradient-to-br from-candy via-fg-2 to-onyx"
      />
    );
  }

  return (
    <Image
      src={SITE.portrait}
      alt={`Portrait of ${SITE.name}`}
      fill
      sizes="(min-width: 1024px) 420px, 28vw"
      priority
      className="object-cover"
    />
  );
}
