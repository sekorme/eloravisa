/**
 * Geometry shared by the SVG globe (Horizon), its marker buttons, and the
 * Three.js globe — so the flat and 3D globes agree on where everything is.
 */

import { ORIGIN } from "../data/destinations"

const D2R = Math.PI / 180
const R2D = 180 / Math.PI

/**
 * Rounds to 3 decimals so server- and client-rendered SVG attributes are
 * byte-identical (Math.sin/cos can differ in the last digit between V8
 * builds, which would trip a hydration mismatch).
 */
export const r3 = (n: number): number => Math.round(n * 1000) / 1000

export interface View {
    /** Longitude at the centre of the visible face. */
    lon: number
    /** Latitude at the centre of the visible face. */
    lat: number
}

/**
 * Orthographic projection of a lat/lon onto a disc centred on `view`.
 * `z` is the cosine of the angle from the view centre: 1 at the centre,
 * 0 at the limb, negative on the far side. `lift` raises the point off the
 * surface (as a fraction of the radius), for flight arcs.
 */
export function projectView(
    lat: number,
    lon: number,
    cx: number,
    cy: number,
    r: number,
    view: View,
    lift = 0
): { x: number; y: number; z: number } {
    const φ = lat * D2R
    const λ = (lon - view.lon) * D2R
    const φ0 = view.lat * D2R
    const k = r * (1 + lift)
    const z = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ)
    return {
        x: r3(cx + k * Math.cos(φ) * Math.sin(λ)),
        y: r3(cy - k * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ))),
        z: r3(z),
    }
}

type LatLon = { lat: number; lon: number }

function toVec({ lat, lon }: LatLon): [number, number, number] {
    const φ = lat * D2R
    const λ = lon * D2R
    return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)]
}

function toLatLon([x, y, z]: [number, number, number]): LatLon {
    return { lat: Math.asin(Math.max(-1, Math.min(1, z))) * R2D, lon: Math.atan2(y, x) * R2D }
}

/** Angular distance between two points, in radians. */
export function angleBetween(a: LatLon, b: LatLon): number {
    const [ax, ay, az] = toVec(a)
    const [bx, by, bz] = toVec(b)
    return Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by + az * bz)))
}

/**
 * Points along the great circle from `a` to `b` (inclusive), each with the
 * altitude a flight arc should have there: zero at both ends, highest in the
 * middle, and higher for longer routes so they never cut through the globe.
 */
export function greatCircle(a: LatLon, b: LatLon, steps = 48): (LatLon & { lift: number })[] {
    const va = toVec(a)
    const vb = toVec(b)
    const ω = angleBetween(a, b)
    const peak = 0.06 + 0.32 * (ω / Math.PI)
    const out: (LatLon & { lift: number })[] = []
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        let v: [number, number, number]
        if (ω < 1e-6) v = va
        else {
            const s = Math.sin(ω)
            const k1 = Math.sin((1 - t) * ω) / s
            const k2 = Math.sin(t * ω) / s
            v = [va[0] * k1 + vb[0] * k2, va[1] * k1 + vb[1] * k2, va[2] * k1 + vb[2] * k2]
        }
        out.push({ ...toLatLon(v), lift: peak * Math.sin(Math.PI * t) })
    }
    return out
}

/**
 * The view that frames the route from the origin (Accra) to `dest`: centred
 * on the route's midpoint, nudged north so the arc sits in the upper,
 * better-lit part of the disc.
 */
export function viewFor(dest: LatLon): View {
    const mid = greatCircle(ORIGIN, dest, 2)[1]
    return { lon: r3(mid.lon), lat: r3(Math.max(-30, Math.min(40, mid.lat + 6))) }
}

/** Shortest signed difference between two longitudes, in degrees. */
export function lonDelta(from: number, to: number): number {
    return ((((to - from) % 360) + 540) % 360) - 180
}
