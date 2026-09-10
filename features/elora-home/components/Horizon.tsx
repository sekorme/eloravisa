/**
 * The world horizon.
 *
 * This is the hero's structural visual and it is a *server-rendered* SVG, not a
 * canvas. That is a performance decision with teeth: it means the hero has its
 * full cinematic composition in the very first HTML response — no blank frame
 * while a 3D bundle downloads, no layout shift when it arrives, and a Largest
 * Contentful Paint that doesn't wait on JavaScript.
 *
 * The R3F globe in `GlobeCanvas.tsx` layers *on top of* this when the device
 * can afford it. This one always renders, and on mobile and under reduced
 * motion it is the whole show.
 *
 * The graticule is drawn as true ellipses under a perspective-ish transform,
 * which is what makes the limb read as a sphere rather than as a circle with
 * lines on it.
 */

import { DESTINATIONS, ORIGIN } from "../data/destinations"

/**
 * Rounds a computed coordinate to 3 decimal places.
 *
 * ------------------------------------------------------------------------
 * THIS PREVENTS A HYDRATION MISMATCH
 * ------------------------------------------------------------------------
 * Every coordinate in this file comes out of `Math.sin` / `Math.cos`. Those are
 * not guaranteed to be bit-identical between the V8 that renders on the server
 * and the V8 in the visitor's browser — the last digit or two can differ. React
 * then serialises `cx="123.45600000000002"` on one side and
 * `cx="123.456"` on the other, and reports a hydration mismatch on the whole
 * subtree.
 *
 * Three decimals is far more precision than a 600-unit viewBox can render, so
 * this costs nothing visually and makes the markup deterministic.
 */
const r3 = (n: number): number => Math.round(n * 1000) / 1000

/**
 * Projects a lat/lon onto the visible face of the globe.
 *
 * Orthographic projection about a centre longitude. Returns `null` for points
 * on the far side, so markers correctly disappear round the limb instead of
 * ghosting through the sphere.
 */
export function project(
    lat: number,
    lon: number,
    cx: number,
    cy: number,
    r: number,
    centreLon = -10,
    centreLat = 22
): { x: number; y: number; z: number } | null {
    const φ = (lat * Math.PI) / 180
    const λ = ((lon - centreLon) * Math.PI) / 180
    const φ0 = (centreLat * Math.PI) / 180

    const cosC = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ)
    if (cosC < 0) return null // far side

    const x = cx + r * Math.cos(φ) * Math.sin(λ)
    const y = cy - r * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ))
    // Rounded so the rendered SVG attributes are byte-identical on server and
    // client. See the note on `r3`.
    return { x: r3(x), y: r3(y), z: r3(cosC) }
}

const CX = 300
const CY = 300
const R = 232

export function Horizon({ className = "" }: { className?: string }) {
    const origin = project(ORIGIN.lat, ORIGIN.lon, CX, CY, R)

    return (
        <svg
            viewBox="0 0 600 600"
            className={className}
            aria-hidden="true"
            focusable="false"
            style={{ width: "100%", height: "auto", overflow: "visible" }}
        >
            <defs>
                {/* The sphere body — lit from upper-left, falling into the page. */}
                <radialGradient id="eh-globe-body" cx="0.34" cy="0.28" r="0.85">
                    <stop offset="0%" stopColor="#246152" />
                    <stop offset="45%" stopColor="#123A30" />
                    <stop offset="100%" stopColor="#061A14" />
                </radialGradient>

                {/* Atmospheric rim — the glow that sells "planet". */}
                <radialGradient id="eh-globe-atmo" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="82%" stopColor="#2E9B72" stopOpacity="0" />
                    <stop offset="94%" stopColor="#5DBF95" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="eh-arc-grad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="55%" stopColor="#5DBF95" />
                    <stop offset="100%" stopColor="#BFE2D1" />
                </linearGradient>

                {/* Terminator: the day/night boundary, as a soft mask. */}
                <linearGradient id="eh-globe-shade" x1="0.15" y1="0.1" x2="1" y2="0.95">
                    <stop offset="40%" stopColor="#03110D" stopOpacity="0" />
                    <stop offset="100%" stopColor="#03110D" stopOpacity="0.8" />
                </linearGradient>

                <clipPath id="eh-globe-clip">
                    <circle cx={CX} cy={CY} r={R} />
                </clipPath>
            </defs>

            {/* Atmosphere sits behind and slightly larger than the body. */}
            <circle cx={CX} cy={CY} r={R * 1.13} fill="url(#eh-globe-atmo)" />

            {/* Body */}
            <circle cx={CX} cy={CY} r={R} fill="url(#eh-globe-body)" />

            <g clipPath="url(#eh-globe-clip)">
                {/* --- graticule: parallels ---------------------------------- */}
                {[-60, -40, -20, 0, 20, 40, 60, 80].map((lat) => {
                    // A parallel projects to an ellipse whose semi-minor axis is
                    // the cosine of the viewing tilt.
                    const φ = (lat * Math.PI) / 180
                    const φ0 = (22 * Math.PI) / 180
                    const ry = r3(Math.abs(R * Math.cos(φ) * Math.sin(φ0))) || 1
                    const rx = r3(R * Math.cos(φ))
                    const cy = r3(CY - R * Math.sin(φ) * Math.cos(φ0))
                    return (
                        <ellipse
                            key={lat}
                            cx={CX}
                            cy={cy}
                            rx={rx}
                            ry={ry}
                            fill="none"
                            stroke="#8FCDAF"
                            strokeOpacity={lat === 0 ? 0.3 : 0.14}
                            strokeWidth={lat === 0 ? 1.1 : 0.7}
                        />
                    )
                })}

                {/* --- graticule: meridians ---------------------------------- */}
                {Array.from({ length: 12 }).map((_, i) => {
                    const rx = r3(R * Math.abs(Math.cos((i * Math.PI) / 12)))
                    return (
                        <ellipse
                            key={i}
                            cx={CX}
                            cy={CY}
                            rx={rx}
                            ry={R}
                            fill="none"
                            stroke="#8FCDAF"
                            strokeOpacity="0.12"
                            strokeWidth="0.7"
                        />
                    )
                })}

                {/* --- coordinate particles ---------------------------------- */}
                {/* Deterministic pseudo-random placement: a fixed lattice jittered
                    by a hash. Deterministic matters — Math.random() here would
                    produce different markup on server and client and trip a
                    hydration mismatch. */}
                {Array.from({ length: 90 }).map((_, i) => {
                    const gLat = ((i * 37) % 150) - 70
                    const gLon = ((i * 53) % 300) - 150
                    const p = project(gLat, gLon, CX, CY, R)
                    if (!p) return null
                    return (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={r3(0.9 + p.z * 0.9)}
                            fill="#BFE2D1"
                            opacity={r3(0.10 + p.z * 0.42)}
                        />
                    )
                })}

                {/* Night side */}
                <rect x="0" y="0" width="600" height="600" fill="url(#eh-globe-shade)" />
            </g>

            {/* --- flight paths ---------------------------------------------- */}
            {/* Drawn outside the clip so the arcs lift off the sphere, which is
                what gives the composition its sense of altitude.

                Each arc carries `pathLength={100}`, normalising every path to the
                same nominal length. That lets one GSAP tween draw all six at an
                identical rate regardless of their real geometric length, and lets
                the CSS start state be written as a plain `stroke-dashoffset: 100`
                without measuring anything at runtime. */}
            <g>
                {DESTINATIONS.map((d, i) => {
                    const to = project(d.lat, d.lon, CX, CY, R)
                    if (!to || !origin) return null

                    // Great-circle-ish arc: a quadratic whose control point is
                    // pushed away from the globe centre, so the path bows
                    // outward like a real flight track.
                    const mx = (origin.x + to.x) / 2
                    const my = (origin.y + to.y) / 2
                    const dx = mx - CX
                    const dy = my - CY
                    const len = Math.hypot(dx, dy) || 1
                    const lift = 46 + i * 8
                    const qx = r3(mx + (dx / len) * lift)
                    const qy = r3(my + (dy / len) * lift)

                    return (
                        <path
                            key={d.id}
                            className="eh-arc"
                            data-arc={d.id}
                            d={`M ${origin.x} ${origin.y} Q ${qx} ${qy} ${to.x} ${to.y}`}
                            fill="none"
                            stroke="url(#eh-arc-grad)"
                            strokeWidth="1.3"
                            strokeOpacity="0.62"
                            strokeLinecap="round"
                            pathLength={100}
                            strokeDasharray="3 4"
                        />
                    )
                })}
            </g>

            {/* --- destination markers ---------------------------------------- */}
            {DESTINATIONS.map((d) => {
                const p = project(d.lat, d.lon, CX, CY, R)
                if (!p) return null
                return (
                    <g key={d.id} data-marker={d.id}>
                        <circle cx={p.x} cy={p.y} r="8" fill="#2E9B72" opacity="0.2" />
                        <circle cx={p.x} cy={p.y} r="3" fill="#BFE2D1" />
                        <text
                            x={p.x + 11}
                            y={p.y + 3.5}
                            fill="#8FCDAF"
                            style={{
                                fontFamily: "var(--eh-font-mono), monospace",
                                fontSize: 9.5,
                                letterSpacing: "0.14em",
                            }}
                        >
                            {d.code}
                        </text>
                    </g>
                )
            })}

            {/* --- origin marker ---------------------------------------------- */}
            {origin ? (
                <g>
                    <circle cx={origin.x} cy={origin.y} r="5.5" fill="#D4AF37" />
                    <circle
                        cx={origin.x}
                        cy={origin.y}
                        r="5.5"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="1.2"
                        opacity="0.55"
                        style={{
                            transformOrigin: `${origin.x}px ${origin.y}px`,
                            animation: "eh-pulse-ring 3s var(--eh-ease-out) infinite",
                        }}
                    />
                    <text
                        x={origin.x + 12}
                        y={origin.y + 4}
                        fill="#F0E2B0"
                        style={{
                            fontFamily: "var(--eh-font-mono), monospace",
                            fontSize: 10,
                            letterSpacing: "0.16em",
                        }}
                    >
                        {ORIGIN.code}
                    </text>
                </g>
            ) : null}
        </svg>
    )
}
