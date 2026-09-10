/**
 * The passport booklet.
 *
 * ------------------------------------------------------------------------
 * WHY THIS IS DRAWN RATHER THAN PHOTOGRAPHED
 * ------------------------------------------------------------------------
 * A photographed passport means either a real one (someone's actual identity
 * document) or a convincing fake. Both are bad. Reproducing a national crest is
 * a licensing problem; producing a realistic visa vignette creates an artefact
 * that could be cropped out of this page and passed off as genuine.
 *
 * So this is an *unbranded* travel document: no country, no crest, no
 * machine-readable zone, no visa sticker. Its realism comes from material
 * treatment — grained cover stock, foil-stamped lettering with a specular
 * sweep, a spine with visible signature stitching, and the paper block's cut
 * page edges — not from imitating any state's artwork. It reads as a passport
 * because of how it is *lit*, which is the honest way to get there.
 *
 * Rendered as inline SVG so it stays crisp at any DPI, costs no network
 * request, recolours from tokens, and can be animated per-layer by GSAP.
 */

interface PassportProps {
    /** Rendered width in px; height follows the 5:7 booklet ratio. */
    width?: number
    className?: string
    /** Unique suffix for gradient ids when more than one is on the page. */
    uid?: string
}

export function Passport({ width = 320, className = "", uid = "a" }: PassportProps) {
    const h = width * 1.4

    const id = (n: string) => `eh-pp-${n}-${uid}`

    return (
        <svg
            width={width}
            height={h}
            viewBox="0 0 320 448"
            fill="none"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                {/* Cover stock: deep navy leatherette with a lit top-left edge. */}
                <linearGradient id={id("cover")} x1="0.1" y1="0" x2="0.9" y2="1">
                    <stop offset="0%" stopColor="#1E5044" />
                    <stop offset="38%" stopColor="#123A30" />
                    <stop offset="100%" stopColor="#061A14" />
                </linearGradient>

                {/* Foil stamp — warm metal, not flat gold. */}
                <linearGradient id={id("foil")} x1="0" y1="0" x2="1" y2="0.6">
                    <stop offset="0%" stopColor="#8C7A4E" />
                    <stop offset="30%" stopColor="#E8D6A0" />
                    <stop offset="52%" stopColor="#FFF4D6" />
                    <stop offset="74%" stopColor="#D9C48C" />
                    <stop offset="100%" stopColor="#8A7748" />
                </linearGradient>

                {/* Cut page edges. */}
                <linearGradient id={id("pages")} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C9C2B0" />
                    <stop offset="35%" stopColor="#F6F2E7" />
                    <stop offset="60%" stopColor="#DED7C6" />
                    <stop offset="100%" stopColor="#A79F8C" />
                </linearGradient>

                {/* Specular sweep across the cover. */}
                <linearGradient id={id("spec")} x1="0" y1="0" x2="0.8" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
                    <stop offset="42%" stopColor="#ffffff" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Cover grain. A fine fractal noise at very low opacity is what
                    stops the cover reading as flat vector fill. */}
                <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.9"
                        numOctaves="3"
                        seed="7"
                        result="noise"
                    />
                    <feColorMatrix
                        in="noise"
                        type="matrix"
                        values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.5 0"
                    />
                </filter>

                {/* Guilloché rosette for the cover emblem — an original
                    interference pattern, not any state's coat of arms. */}
                <radialGradient id={id("rose")}>
                    <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8A7748" stopOpacity="0.25" />
                </radialGradient>

                <clipPath id={id("clip")}>
                    <rect x="26" y="8" width="286" height="432" rx="14" />
                </clipPath>
            </defs>

            {/* ---- paper block (sits proud of the cover on the fore edge) ---- */}
            <rect x="18" y="16" width="288" height="418" rx="10" fill={`url(#${id("pages")})`} />
            {/* Individual signature edges — the detail that sells "many pages". */}
            {[0, 1, 2, 3, 4].map((i) => (
                <rect
                    key={i}
                    x="18"
                    y={22 + i * 82}
                    width="288"
                    height="1.2"
                    fill="#8F8878"
                    opacity="0.5"
                />
            ))}

            {/* ---- cover ---- */}
            <g clipPath={`url(#${id("clip")})`}>
                <rect x="26" y="8" width="286" height="432" rx="14" fill={`url(#${id("cover")})`} />

                {/* Grain */}
                <rect
                    x="26"
                    y="8"
                    width="286"
                    height="432"
                    filter={`url(#${id("grain")})`}
                    opacity="0.18"
                    style={{ mixBlendMode: "overlay" }}
                />

                {/* Specular sweep */}
                <rect x="26" y="8" width="286" height="432" fill={`url(#${id("spec")})`} />

                {/* Blind-embossed border, drawn as a light and a dark line
                    offset by 1px — that is literally how an emboss reads. */}
                <rect
                    x="46"
                    y="28"
                    width="246"
                    height="392"
                    rx="6"
                    stroke="#000000"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                />
                <rect
                    x="46"
                    y="27"
                    width="246"
                    height="392"
                    rx="6"
                    stroke="#ffffff"
                    strokeOpacity="0.07"
                    strokeWidth="1"
                />
            </g>

            {/* ---- foil lettering (generic; no nation, no crest) ---- */}
            <text
                x="169"
                y="74"
                textAnchor="middle"
                fill={`url(#${id("foil")})`}
                style={{
                    fontFamily: "var(--eh-font-mono), monospace",
                    fontSize: 11,
                    letterSpacing: "0.34em",
                }}
            >
                TRAVEL
            </text>
            <text
                x="169"
                y="94"
                textAnchor="middle"
                fill={`url(#${id("foil")})`}
                style={{
                    fontFamily: "var(--eh-font-mono), monospace",
                    fontSize: 11,
                    letterSpacing: "0.34em",
                }}
            >
                DOCUMENT
            </text>

            {/* ---- cover emblem: concentric guilloché rosette ---- */}
            <g transform="translate(169 232)" opacity="0.92">
                <circle r="52" fill="none" stroke={`url(#${id("foil")})`} strokeWidth="0.9" />
                <circle r="43" fill="none" stroke={`url(#${id("foil")})`} strokeWidth="0.7" opacity="0.8" />
                <circle r="15" fill={`url(#${id("rose")})`} opacity="0.5" />
                {/* Interference lines — 24 rotated ellipses generate the classic
                    security-print rosette without any external asset. */}
                {Array.from({ length: 24 }).map((_, i) => (
                    <ellipse
                        key={i}
                        rx="47"
                        ry="17"
                        fill="none"
                        stroke={`url(#${id("foil")})`}
                        strokeWidth="0.55"
                        opacity="0.45"
                        transform={`rotate(${i * 7.5})`}
                    />
                ))}
            </g>

            {/* ---- chip (contactless symbol, generic) ---- */}
            <g transform="translate(169 350)" opacity="0.85">
                <rect x="-13" y="-10" width="26" height="20" rx="3" fill={`url(#${id("foil")})`} opacity="0.55" />
                <path
                    d="M-5 -4a7 7 0 0 1 0 8M0 -8a12 12 0 0 1 0 16"
                    fill="none"
                    stroke="var(--eh-ng-900)"
                    strokeOpacity="0.55"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
            </g>

            {/* ---- spine: fold shadow + signature stitching ---- */}
            <rect x="26" y="8" width="16" height="432" fill="#03110D" opacity="0.55" />
            <rect x="40" y="8" width="3" height="432" fill="#ffffff" opacity="0.05" />
            {Array.from({ length: 9 }).map((_, i) => (
                <rect
                    key={i}
                    x="32"
                    y={44 + i * 44}
                    width="4"
                    height="14"
                    rx="2"
                    fill="#D9C48C"
                    opacity="0.28"
                />
            ))}
        </svg>
    )
}
