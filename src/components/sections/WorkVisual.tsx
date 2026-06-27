/**
 * Abstract domain-themed illustrations rendered into each Work card's
 * background. Pure geometric art — no real product UI is referenced.
 * Each one picks up the page's --fg and --candy tokens via CSS variables
 * so it stays on theme in both light and dark mode.
 */

type Props = Readonly<{ slot: string }>;

export function WorkVisual({ slot }: Props): React.ReactElement {
  switch (slot) {
    case "work-studiosync":
      return <PlatformVisual />;
    case "work-bayobab":
      return <PortalVisual />;
    case "work-eteller":
      return <FintechVisual />;
    case "work-gis":
      return <GisVisual />;
    default:
      return <PlatformVisual />;
  }
}

/* ---------- shared SVG primitives ---------- */

const BG_LIGHT = "var(--card-soft, #2f3236)";
const BG_DARK = "#0c1316";
const FG_TINT = "rgba(255,255,255,0.07)";
const FG_LINE = "rgba(255,255,255,0.16)";
const FG_TEXT = "rgba(255,255,255,0.6)";
const ACCENT = "var(--candy, #b2d5e5)";

/* ---------- 1. Platform: dashboard panels + sparkline ---------- */

function PlatformVisual(): React.ReactElement {
  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="pv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
      </defs>
      <rect width="600" height="412" fill="url(#pv-bg)" />

      {/* sidebar rail */}
      <rect x="32" y="32" width="116" height="348" rx="14" fill={FG_TINT} />
      {[64, 100, 136, 172, 208].map((y, i) => (
        <rect key={y} x="50" y={y} width={i === 0 ? 80 : 64 + (i % 2) * 12} height="10" rx="5" fill={i === 0 ? ACCENT : FG_LINE} opacity={i === 0 ? 1 : 0.7} />
      ))}

      {/* top KPI cards */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${172 + i * 132}, 32)`}>
          <rect width="120" height="92" rx="14" fill={FG_TINT} />
          <rect x="14" y="18" width="56" height="8" rx="4" fill={FG_TEXT} opacity="0.4" />
          <rect x="14" y="40" width={36 + i * 8} height="18" rx="4" fill={i === 1 ? ACCENT : "rgba(255,255,255,0.9)"} />
          <rect x="14" y="70" width="40" height="6" rx="3" fill={FG_TEXT} opacity="0.35" />
        </g>
      ))}

      {/* deploy sparkline panel */}
      <g transform="translate(172, 142)">
        <rect width="384" height="160" rx="16" fill={FG_TINT} />
        <rect x="18" y="18" width="120" height="10" rx="5" fill={FG_TEXT} opacity="0.5" />
        <polyline
          points="22,128 70,108 110,118 152,86 196,96 240,62 282,76 326,48 366,58"
          fill="none"
          stroke={ACCENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* dots */}
        {[22, 70, 110, 152, 196, 240, 282, 326, 366].map((x, i) => {
          const ys = [128, 108, 118, 86, 96, 62, 76, 48, 58];
          return <circle key={x} cx={x} cy={ys[i]} r="3" fill={ACCENT} />;
        })}
      </g>

      {/* status pills */}
      <g transform="translate(172, 322)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 132}, 0)`}>
            <rect width="120" height="58" rx="14" fill={FG_TINT} />
            <circle cx="18" cy="29" r="5" fill={i === 0 ? ACCENT : FG_LINE} />
            <rect x="32" y="20" width="68" height="8" rx="4" fill={FG_TEXT} opacity="0.5" />
            <rect x="32" y="34" width="48" height="6" rx="3" fill={FG_TEXT} opacity="0.32" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- 2. Frontend / Portal: browser chrome + sign-in form ---------- */

function PortalVisual(): React.ReactElement {
  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="bv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
      </defs>
      <rect width="600" height="412" fill="url(#bv-bg)" />

      {/* browser frame */}
      <rect x="44" y="48" width="512" height="316" rx="18" fill={FG_TINT} />
      <rect x="44" y="48" width="512" height="36" rx="18" fill="rgba(255,255,255,0.04)" />
      <circle cx="68" cy="66" r="5" fill="rgba(255,255,255,0.22)" />
      <circle cx="86" cy="66" r="5" fill="rgba(255,255,255,0.22)" />
      <circle cx="104" cy="66" r="5" fill="rgba(255,255,255,0.22)" />
      <rect x="138" y="58" width="280" height="16" rx="8" fill="rgba(255,255,255,0.08)" />

      {/* main panel headline */}
      <rect x="80" y="116" width="220" height="14" rx="7" fill={ACCENT} />
      <rect x="80" y="138" width="320" height="10" rx="5" fill={FG_LINE} />
      <rect x="80" y="156" width="240" height="10" rx="5" fill={FG_LINE} opacity="0.7" />

      {/* form fields */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(80, ${200 + i * 56})`}>
          <rect width="280" height="44" rx="10" fill="rgba(255,255,255,0.05)" stroke={FG_LINE} />
          <rect x="16" y="18" width="120" height="8" rx="4" fill={FG_TEXT} opacity="0.4" />
        </g>
      ))}

      {/* CTA button */}
      <g transform="translate(80, 320)">
        <rect width="160" height="44" rx="22" fill={ACCENT} />
        <rect x="32" y="18" width="96" height="8" rx="4" fill="rgba(6,24,31,0.8)" />
      </g>

      {/* sidebar mini-cards */}
      <g transform="translate(400, 116)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0, ${i * 76})`}>
            <rect width="136" height="60" rx="12" fill="rgba(255,255,255,0.05)" />
            <rect x="14" y="14" width="60" height="8" rx="4" fill={FG_TEXT} opacity="0.5" />
            <rect x="14" y="30" width="100" height="8" rx="4" fill={FG_LINE} />
            <rect x="14" y="42" width="64" height="6" rx="3" fill={FG_TEXT} opacity="0.32" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- 3. Fintech: payment card + transaction rows ---------- */

function FintechVisual(): React.ReactElement {
  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="fv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
        <linearGradient id="fv-card" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#1d2530" />
          <stop offset="100%" stopColor="#0a1018" />
        </linearGradient>
      </defs>
      <rect width="600" height="412" fill="url(#fv-bg)" />

      {/* virtual card */}
      <g transform="translate(60, 70) rotate(-6 130 80)">
        <rect width="260" height="160" rx="18" fill="url(#fv-card)" stroke="rgba(255,255,255,0.08)" />
        {/* chip */}
        <rect x="22" y="34" width="36" height="26" rx="6" fill={ACCENT} opacity="0.85" />
        <rect x="28" y="40" width="24" height="3" rx="1.5" fill="rgba(0,0,0,0.35)" />
        <rect x="28" y="46" width="24" height="3" rx="1.5" fill="rgba(0,0,0,0.35)" />
        {/* digits */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${22 + i * 56}, 90)`}>
            {[0, 1, 2, 3].map((j) => (
              <circle key={j} cx={j * 8} cy="0" r="2.6" fill="rgba(255,255,255,0.55)" />
            ))}
          </g>
        ))}
        {/* labels */}
        <rect x="22" y="124" width="56" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
        <rect x="22" y="134" width="80" height="8" rx="4" fill="rgba(255,255,255,0.7)" />
      </g>

      {/* transaction list panel */}
      <g transform="translate(340, 56)">
        <rect width="216" height="300" rx="16" fill={FG_TINT} />
        <rect x="18" y="20" width="80" height="10" rx="5" fill={FG_TEXT} opacity="0.5" />
        <rect x="18" y="36" width="120" height="14" rx="7" fill={ACCENT} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(18, ${70 + i * 52})`}>
            <circle cx="14" cy="18" r="12" fill="rgba(255,255,255,0.06)" />
            <circle cx="14" cy="18" r="5" fill={i === 0 ? ACCENT : FG_LINE} />
            <rect x="36" y="8" width="120" height="8" rx="4" fill={FG_TEXT} opacity="0.55" />
            <rect x="36" y="22" width="80" height="6" rx="3" fill={FG_TEXT} opacity="0.3" />
            <rect x="160" y="14" width={32 + (i % 2) * 10} height="8" rx="4" fill={i % 2 === 0 ? ACCENT : "rgba(255,255,255,0.8)"} opacity={i % 2 === 0 ? 0.85 : 0.65} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ---------- 4. GIS: map grid with nodes + paths ---------- */

function GisVisual(): React.ReactElement {
  // Pre-computed node positions to avoid math at render time.
  const nodes: ReadonlyArray<{ x: number; y: number; r: number; accent?: boolean }> = [
    { x: 90, y: 90, r: 6 },
    { x: 200, y: 130, r: 5 },
    { x: 320, y: 80, r: 7, accent: true },
    { x: 430, y: 150, r: 5 },
    { x: 510, y: 90, r: 5 },
    { x: 140, y: 250, r: 5 },
    { x: 270, y: 220, r: 6 },
    { x: 380, y: 280, r: 5 },
    { x: 480, y: 240, r: 6, accent: true },
    { x: 220, y: 340, r: 5 },
    { x: 360, y: 360, r: 5 },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [1, 5], [2, 6], [3, 7], [4, 8],
    [5, 9], [6, 9], [6, 10], [7, 10], [8, 7],
  ];

  return (
    <svg viewBox="0 0 600 412" preserveAspectRatio="xMidYMid slice" className="work-visual" aria-hidden="true">
      <defs>
        <linearGradient id="gv-bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={BG_LIGHT} />
          <stop offset="100%" stopColor={BG_DARK} />
        </linearGradient>
        <pattern id="gv-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="600" height="412" fill="url(#gv-bg)" />
      <rect width="600" height="412" fill="url(#gv-grid)" />

      {/* contour-ish curves */}
      <path d="M 0 280 Q 150 240, 300 270 T 600 250" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <path d="M 0 320 Q 180 290, 320 310 T 600 295" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
      <path d="M 0 200 Q 200 160, 380 190 T 600 180" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

      {/* edges */}
      {edges.map(([a, b], i) => {
        const A = nodes[a];
        const B = nodes[b];
        return (
          <line
            key={i}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={ACCENT}
            strokeOpacity="0.55"
            strokeWidth="1.4"
            strokeDasharray="3 4"
          />
        );
      })}

      {/* nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r + 6} fill={n.accent ? ACCENT : "rgba(255,255,255,0.05)"} opacity={n.accent ? 0.18 : 1} />
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.accent ? ACCENT : "rgba(255,255,255,0.85)"} />
        </g>
      ))}

      {/* mini compass / scale bar */}
      <g transform="translate(40, 360)">
        <rect width="120" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
        <rect width="60" height="6" rx="3" fill={ACCENT} />
        <rect y="14" width="48" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
      </g>
    </svg>
  );
}
