/**
 * The SVG globe for the destination scene.
 *
 * Server-rendered and complete in the first HTML response: dotted continents,
 * a true orthographic graticule, the flight routes from Accra, and the
 * markers. On phones, under reduced motion, and on devices that don't get
 * the Three.js globe, this is the whole show; where the 3D globe does load
 * (GlobeLayer), it fades in exactly on top of this one.
 *
 * The globe is drawn from a `view` — the lat/lon at the centre of the disc.
 * GlobalGuidance animates that view to frame whichever route is selected, so
 * the globe turns to show it (and Australia, on the far side from the
 * default view, becomes reachable).
 */

import { DESTINATIONS, ORIGIN } from "../data/destinations"
import { LAND_COARSE } from "../data/globeLand"
import { greatCircle, projectView, r3, type View } from "./globeGeo"

export const CX = 300
export const CY = 300
export const R = 232

/** Back-compat helper: project onto this globe's disc for a given view. */
export function project(lat: number, lon: number, view: View) {
    const p = projectView(lat, lon, CX, CY, R, view)
    return p.z < 0 ? null : p
}

/** Land dots as three SVG paths (by depth), each dot a zero-length round cap. */
function landPaths(view: View): [string, string, string] {
    const bands: [string[], string[], string[]] = [[], [], []]
    for (let i = 0; i < LAND_COARSE.length; i += 2) {
        const p = projectView(LAND_COARSE[i] / 10, LAND_COARSE[i + 1] / 10, CX, CY, R, view)
        if (p.z <= 0.02) continue
        const band = p.z > 0.55 ? 0 : p.z > 0.25 ? 1 : 2
        bands[band].push(`M${p.x} ${p.y}h0`)
    }
    return [bands[0].join(""), bands[1].join(""), bands[2].join("")]
}

/** Graticule lines, true to the projection, broken where they pass behind. */
function graticule(view: View): string {
    const segs: string[] = []
    const line = (pts: { x: number; y: number; z: number }[]) => {
        let d = ""
        let pen = false
        for (const p of pts) {
            if (p.z < 0) {
                pen = false
                continue
            }
            d += `${pen ? "L" : "M"}${p.x} ${p.y}`
            pen = true
        }
        if (d) segs.push(d)
    }
    for (let lat = -60; lat <= 60; lat += 30) {
        const pts = []
        for (let lon = -180; lon <= 180; lon += 6) pts.push(projectView(lat, lon, CX, CY, R, view))
        line(pts)
    }
    for (let lon = -180; lon < 180; lon += 30) {
        const pts = []
        for (let lat = -84; lat <= 84; lat += 6) pts.push(projectView(lat, lon, CX, CY, R, view))
        line(pts)
    }
    return segs.join("")
}

/** A flight arc as a path, lifted off the surface; only the visible part. */
export function arcPath(dest: { lat: number; lon: number }, view: View): string {
    let d = ""
    let pen = false
    for (const p of greatCircle(ORIGIN, dest, 40)) {
        const q = projectView(p.lat, p.lon, CX, CY, R, view, p.lift)
        // A lifted point is still visible a little past the limb.
        if (q.z < -p.lift * 0.9) {
            pen = false
            continue
        }
        d += `${pen ? "L" : "M"}${q.x} ${q.y}`
        pen = true
    }
    return d
}

export function Horizon({
    view,
    selectedId,
    comet = true,
    className = "",
}: {
    view: View
    selectedId: string
    /** Animate a glowing dot along the selected route. */
    comet?: boolean
    className?: string
}) {
    const [front, mid, limb] = landPaths(view)
    const origin = projectView(ORIGIN.lat, ORIGIN.lon, CX, CY, R, view)
    const selected = DESTINATIONS.find((d) => d.id === selectedId) ?? DESTINATIONS[0]
    const selectedArc = arcPath(selected, view)

    return (
        <svg
            viewBox="0 0 600 600"
            className={className}
            aria-hidden="true"
            focusable="false"
            style={{ width: "100%", height: "auto", overflow: "visible" }}
        >
            <defs>
                {/* Body, lit from upper-left. */}
                <radialGradient id="eh-globe-body" cx="0.36" cy="0.3" r="0.8">
                    <stop offset="0%" stopColor="#1F5A4A" />
                    <stop offset="50%" stopColor="#0F3329" />
                    <stop offset="100%" stopColor="#051611" />
                </radialGradient>

                {/* Atmosphere rim. */}
                <radialGradient id="eh-globe-atmo" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="80%" stopColor="#2E9B72" stopOpacity="0" />
                    <stop offset="91%" stopColor="#5DBF95" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#5DBF95" stopOpacity="0" />
                </radialGradient>

                {/* Night side, to give the sphere volume. */}
                <radialGradient id="eh-globe-shade" cx="0.32" cy="0.28" r="0.95">
                    <stop offset="55%" stopColor="#020B08" stopOpacity="0" />
                    <stop offset="100%" stopColor="#020B08" stopOpacity="0.7" />
                </radialGradient>

                <radialGradient id="eh-globe-comet">
                    <stop offset="0%" stopColor="#FFF4D6" />
                    <stop offset="35%" stopColor="#E8C766" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </radialGradient>

                <clipPath id="eh-globe-clip">
                    <circle cx={CX} cy={CY} r={R} />
                </clipPath>
            </defs>

            <circle cx={CX} cy={CY} r={R * 1.12} fill="url(#eh-globe-atmo)" />
            <circle cx={CX} cy={CY} r={R} fill="url(#eh-globe-body)" />

            <g clipPath="url(#eh-globe-clip)">
                <path d={graticule(view)} fill="none" stroke="#8FCDAF" strokeOpacity="0.1" strokeWidth="0.7" />

                {/* Continents: brighter toward the centre, fading at the limb. */}
                <g fill="none" strokeLinecap="round">
                    <path d={limb} stroke="#7FC4A4" strokeOpacity="0.28" strokeWidth="2.4" />
                    <path d={mid} stroke="#8FCDAF" strokeOpacity="0.5" strokeWidth="2.9" />
                    <path d={front} stroke="#A9DCC3" strokeOpacity="0.72" strokeWidth="3.2" />
                </g>

                <rect x="0" y="0" width="600" height="600" fill="url(#eh-globe-shade)" />
            </g>

            {/* Thin rim highlight. */}
            <circle cx={CX} cy={CY} r={R - 0.5} fill="none" stroke="#8FCDAF" strokeOpacity="0.22" strokeWidth="1" />

            {/* The selected route, in gold. (Only that one: routes running
                round the back of the globe read as stray lines.) */}
            <g fill="none" strokeLinecap="round">
                <path d={selectedArc} stroke="#D4AF37" strokeOpacity="0.25" strokeWidth="6" />
                <path d={selectedArc} stroke="#E8C766" strokeWidth="1.8" />
            </g>

            {comet && selectedArc && (
                <circle r="7" fill="url(#eh-globe-comet)">
                    {/* Restarts when the destination changes (new key); while the
                        globe turns, the path updates in place. */}
                    <animateMotion key={selected.id} dur="2.8s" repeatCount="indefinite" path={selectedArc} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
                </circle>
            )}

            {/* Origin: Accra. */}
            {origin.z > 0 && (
                <g>
                    <circle cx={origin.x} cy={origin.y} r="5" fill="#D4AF37" />
                    <circle
                        cx={origin.x}
                        cy={origin.y}
                        r="5"
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
                        x={r3(origin.x + 11)}
                        y={r3(origin.y + 4)}
                        fill="#F0E2B0"
                        style={{ fontFamily: "var(--eh-font-mono), monospace", fontSize: 10, letterSpacing: "0.16em" }}
                    >
                        ACCRA
                    </text>
                </g>
            )}
        </svg>
    )
}
