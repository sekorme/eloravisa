import countries from "world-countries"

/**
 * Destination personality for the welcome banner: a flag emoji and a simple
 * line drawing of a landmark. Hand-drawn SVG paths in currentColor, so they
 * take the banner's green at low opacity and add no image downloads.
 */

/** "United States" -> 🇺🇸 (regional-indicator letters from the ISO code). */
export function flagFor(country?: string | null): string {
  if (!country) return ""
  const code = countries.find((c) => c.name.common === country || c.name.official === country)?.cca2
  if (!code) return ""
  return String.fromCodePoint(...[...code.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}

type Art = { label: string; paths: string[] }

const ART: Record<string, Art> = {
  "United States": {
    label: "Statue of Liberty",
    paths: [
      "M100 40 L104 18 M104 18 L100 12 L108 14 Z", // torch
      "M100 40 L96 62", // raised arm
      "M88 58 L84 50 M92 56 L90 46 M98 56 L100 46 M104 58 L108 50 M108 62 L114 56", // crown rays
      "M86 66 Q92 56 104 62 Q108 70 104 78", // head
      "M90 78 Q84 110 88 140 L114 140 Q118 108 110 78 Z", // robe
      "M96 90 L92 112 M104 92 L108 118", // folds
      "M78 140 L122 140 L126 156 L74 156 Z M70 156 L130 156 L134 186 L66 186 Z", // pedestal
      "M84 166 L84 178 M100 166 L100 178 M116 166 L116 178",
    ],
  },
  "United Kingdom": {
    label: "Big Ben",
    paths: [
      "M100 10 L94 30 L106 30 Z", // spire
      "M90 30 L110 30 L112 46 L88 46 Z", // belfry roof
      "M86 46 L114 46 L114 90 L86 90 Z", // clock stage
      "M100 68 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", // clock face
      "M100 68 L100 60 M100 68 L106 72",
      "M84 90 L116 90 L118 186 L82 186 Z", // shaft
      "M92 100 L92 180 M100 100 L100 180 M108 100 L108 180",
      "M78 186 L122 186",
    ],
  },
  Canada: {
    label: "Maple leaf",
    paths: [
      "M100 24 L110 48 L124 42 L120 70 L142 58 L136 78 L156 80 L138 98 L144 110 L114 106 L112 130 L100 120 L88 130 L86 106 L56 110 L62 98 L44 80 L64 78 L58 58 L80 70 L76 42 L90 48 Z",
      "M100 120 L100 176",
    ],
  },
  Germany: {
    label: "Brandenburg Gate",
    paths: [
      "M92 30 L108 30 L108 40 L92 40 Z M96 30 L100 22 L104 30", // quadriga
      "M40 50 L160 50 L160 66 L40 66 Z", // attic
      "M36 66 L164 66 L164 74 L36 74 Z", // entablature
      "M44 74 L44 170 M60 74 L60 170 M80 74 L80 170 M96 74 L96 170 M104 74 L104 170 M120 74 L120 170 M140 74 L140 170 M156 74 L156 170",
      "M34 170 L166 170 L166 180 L34 180 Z",
    ],
  },
  Australia: {
    label: "Sydney Opera House",
    paths: [
      "M30 150 Q52 86 74 150", "M58 150 Q86 70 112 150", "M96 150 Q128 60 156 150", "M140 150 Q158 104 172 150",
      "M24 150 L178 150 L170 166 L32 166 Z",
      "M20 178 Q50 172 80 178 T140 178 T190 178", // water
    ],
  },
  France: {
    label: "Eiffel Tower",
    paths: [
      "M100 12 L100 30", "M96 30 L104 30 L110 80 L90 80 Z",
      "M86 80 L114 80 L124 120 L76 120 Z", "M80 100 L120 100",
      "M72 120 L128 120 L150 186 L128 186 Q100 150 72 186 L50 186 Z",
    ],
  },
}

const GLOBE: Art = {
  label: "Globe",
  paths: [
    "M100 100 m-64 0 a64 64 0 1 0 128 0 a64 64 0 1 0 -128 0",
    "M100 36 Q70 100 100 164 Q130 100 100 36",
    "M36 100 L164 100 M46 68 Q100 80 154 68 M46 132 Q100 120 154 132",
    "M150 40 L176 30 L170 44 Z", // plane
  ],
}

export function Landmark({ country, className }: { country?: string | null; className?: string }) {
  const art = (country && ART[country]) || GLOBE
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} role="img" aria-label={art.label}>
      {art.paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}
