import type { Service } from "@/lib/constants";

type ServiceCardProps = Readonly<{
  service: Service;
  /** Used for heading id so anchor scroll + label-by association works. */
  index: number;
}>;

/**
 * Inner content of a single service card — title, body, capabilities.
 * Pure presentational; the sticky positioning + dark backdrop live in
 * the parent `Services` so this stays reusable and testable in isolation.
 */
export function ServiceCard({ service, index }: ServiceCardProps): React.ReactElement {
  const headingId = `service-${index}-heading`;

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="grid gap-8 md:grid-cols-[1fr_2fr] md:gap-12"
    >
      <h3
        id={headingId}
        className="text-balance text-4xl font-semibold leading-[0.95] tracking-tight text-card-fg md:text-6xl"
      >
        {service.titleLineOne}
        <br />
        {service.titleLineTwo}
      </h3>
      <div className="flex flex-col gap-6">
        <p className="text-lg leading-relaxed text-card-muted md:text-xl">
          {service.body}
        </p>
        <ul aria-label={`${service.titleLineOne} capabilities`} className="flex flex-wrap gap-2">
          {service.capabilities.map((capability) => (
            <li
              key={capability}
              className="rounded-full border border-card-fg/15 px-3 py-1 text-sm text-card-fg/85"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
