// Static, dependency-free placeholder for the interactive hero globe.
// Used both as the code-split loading state and as the permanent view on
// mobile / reduced-motion / no-WebGL — never imports three.js or R3F.
export function HeroGlobeFallback() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-full min-h-[320px] flex items-center justify-center overflow-hidden rounded-[2rem]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-landing-navy via-[#0B1F3A] to-landing-navy" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.25),transparent_60%)]" />

      <svg viewBox="0 0 320 320" className="relative w-4/5 max-w-[340px] aspect-square" role="presentation">
        <circle cx="160" cy="160" r="120" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="1" />
        <ellipse cx="160" cy="160" rx="120" ry="42" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
        <ellipse cx="160" cy="160" rx="70" ry="120" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
        <path d="M60 130 Q160 40 260 150" fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <path d="M70 210 Q160 260 250 190" fill="none" stroke="#EC16D7" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <circle cx="60" cy="130" r="4" fill="#22D3EE" />
        <circle cx="260" cy="150" r="4" fill="#2563EB" />
        <circle cx="70" cy="210" r="4" fill="#7C3AED" />
        <circle cx="250" cy="190" r="4" fill="#EC16D7" />
      </svg>
    </div>
  )
}
