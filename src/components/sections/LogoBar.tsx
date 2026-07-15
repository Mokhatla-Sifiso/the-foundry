"use client";
import { siAccenture, siGeneralelectric } from "simple-icons";
import { Reveal } from "@/components/primitives/Reveal";

type Brand = Readonly<
  { name: string; ariaLabel: string } & (
    | { kind: "icon"; iconPath: string; viewBox?: string }
    | { kind: "text"; display: string }
  )
>;

const BRANDS: ReadonlyArray<Brand> = [
  {
    name: "Accenture",
    ariaLabel: "Accenture",
    kind: "icon",
    iconPath: siAccenture.path,
  },
  { name: "MTN Group", ariaLabel: "MTN Group", kind: "text", display: "MTN Group" },
  {
    name: "GE Smallworld",
    ariaLabel: "General Electric Smallworld",
    kind: "icon",
    iconPath: siGeneralelectric.path,
  },
  { name: "NMB Bank", ariaLabel: "NMB Bank", kind: "text", display: "NMB Bank" },
  { name: "Bayobab", ariaLabel: "Bayobab", kind: "text", display: "Bayobab" },
  { name: "Nybble", ariaLabel: "Nybble Technologies", kind: "text", display: "Nybble" },
  { name: "IST", ariaLabel: "IST", kind: "text", display: "IST" },
];

export function LogoBar(): React.ReactElement {
  return (
    <Reveal delay={0.12} className="logo-bar-wrap">
      <p className="logo-bar-eyebrow">Trusted across</p>
      <ul className="logo-bar" aria-label="Companies and products I've shipped with">
        {BRANDS.map((b) => (
          <li key={b.name} className="logo-bar-item">
            {b.kind === "icon" ? (
              <svg
                viewBox={b.viewBox ?? "0 0 24 24"}
                role="img"
                aria-label={b.ariaLabel}
                className="logo-bar-svg"
              >
                <path d={b.iconPath} fill="currentColor" />
              </svg>
            ) : (
              <span className="logo-bar-text" aria-label={b.ariaLabel}>
                {b.display}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
