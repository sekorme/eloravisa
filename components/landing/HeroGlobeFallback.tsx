// Static, dependency-free placeholder for the interactive hero globe.
// Used both as the code-split loading state and as the permanent view on
// mobile / reduced-motion / no-WebGL — never imports three.js or R3F.
export function HeroGlobeFallback() {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-center justify-center">
      <div className="absolute -inset-[10%] bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.45),rgba(30,108,240,0.12)_45%,transparent_68%)]" />
      <svg viewBox="0 0 320 320" className="relative h-[86%] w-[86%] drop-shadow-[0_30px_50px_rgba(12,38,71,0.35)]" role="presentation">
        <defs>
          <radialGradient id="lp-globe-body" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#4f8ff7" />
            <stop offset="55%" stopColor="#1650b8" />
            <stop offset="100%" stopColor="#0a2a6b" />
          </radialGradient>
          <pattern id="lp-globe-dots" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="rgba(191,219,254,0.55)" />
          </pattern>
          <clipPath id="lp-globe-clip">
            <circle cx="160" cy="160" r="128" />
          </clipPath>
        </defs>
        <circle cx="160" cy="160" r="128" fill="url(#lp-globe-body)" />
        <g clipPath="url(#lp-globe-clip)">
          <rect x="0" y="0" width="320" height="320" fill="url(#lp-globe-dots)" />
          <ellipse cx="160" cy="160" rx="128" ry="44" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <ellipse cx="160" cy="160" rx="74" ry="128" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          <ellipse cx="160" cy="160" rx="24" ry="128" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </g>
        <path d="M70 140 Q160 40 250 150" fill="none" stroke="#7dd3fc" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <path d="M80 210 Q160 268 246 190" fill="none" stroke="#f9a8d4" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <circle cx="70" cy="140" r="4" fill="#fff" />
        <circle cx="250" cy="150" r="4" fill="#fff" />
        <circle cx="80" cy="210" r="4" fill="#fff" />
        <circle cx="246" cy="190" r="4" fill="#fff" />
        <circle cx="160" cy="160" r="128" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      </svg>
    </div>
  )
}
