"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { DESTINATIONS, ORIGIN } from "../data/destinations"

/**
 * The R3F globe — the *only* place this project uses Three.js.
 *
 * ------------------------------------------------------------------------
 * WHY 3D IS JUSTIFIED HERE AND NOWHERE ELSE
 * ------------------------------------------------------------------------
 * Three.js earns its bundle when depth is the actual content. On a globe it is:
 * markers must occlude correctly behind the limb, arcs must lift off a curved
 * surface, and rotation must be continuous rather than a sprite swap. Every
 * other visual on this page is better as SVG or CSS, and is built that way.
 *
 * This module is never in the initial bundle. `GlobeLayer` imports it through
 * `next/dynamic` with `ssr: false`, behind a capability gate, after the page is
 * interactive — so Three.js downloads only for visitors who will actually see
 * it, and never blocks first paint or LCP.
 *
 * Deliberately cheap: points and lines, no textures, no post-processing, no
 * shadows, capped DPR, and `frameloop="demand"` is avoided only because the
 * globe rotates continuously — but it stops entirely when scrolled offscreen
 * (see `GlobeLayer`).
 */

/** Lat/lon (degrees) to a point on a sphere of radius `r`. */
function toVector3(lat: number, lon: number, r: number): THREE.Vector3 {
    const φ = (90 - lat) * (Math.PI / 180)
    const θ = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(
        -r * Math.sin(φ) * Math.cos(θ),
        r * Math.cos(φ),
        r * Math.sin(φ) * Math.sin(θ)
    )
}

const RADIUS = 1.6

/** The point cloud that reads as landmass-free "coordinates". */
function GlobePoints() {
    const geometry = useMemo(() => {
        // Fibonacci sphere: an even distribution with no polar clustering, which
        // is what a naive lat/lon grid produces and why those always look wrong.
        const count = 2600
        const positions = new Float32Array(count * 3)
        const golden = Math.PI * (3 - Math.sqrt(5))

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2
            const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
            const theta = golden * i

            positions[i * 3] = Math.cos(theta) * radiusAtY * RADIUS
            positions[i * 3 + 1] = y * RADIUS
            positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * RADIUS
        }

        const g = new THREE.BufferGeometry()
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        return g
    }, [])

    return (
        <points geometry={geometry}>
            <pointsMaterial
                size={0.016}
                color="#8FCDAF"
                transparent
                opacity={0.55}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    )
}

/** Latitude rings — the graticule that makes the sphere legible. */
function Graticule() {
    const rings = useMemo(() => {
        const out: THREE.BufferGeometry[] = []
        for (let lat = -60; lat <= 60; lat += 30) {
            const φ = (lat * Math.PI) / 180
            const r = RADIUS * Math.cos(φ)
            const y = RADIUS * Math.sin(φ)
            const pts: THREE.Vector3[] = []
            for (let i = 0; i <= 96; i++) {
                const a = (i / 96) * Math.PI * 2
                pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r))
            }
            out.push(new THREE.BufferGeometry().setFromPoints(pts))
        }
        return out
    }, [])

    return (
        <>
            {rings.map((g, i) => (
                <primitive key={i} object={new THREE.Line(g, new THREE.LineBasicMaterial({
                    color: "#8FCDAF",
                    transparent: true,
                    opacity: 0.16,
                }))} />
            ))}
        </>
    )
}

/** Great-circle-ish arcs from the origin to each destination. */
function FlightArcs() {
    const arcs = useMemo(() => {
        const from = toVector3(ORIGIN.lat, ORIGIN.lon, RADIUS)

        return DESTINATIONS.map((d) => {
            const to = toVector3(d.lat, d.lon, RADIUS)
            // Lift the midpoint off the surface so the arc reads as altitude.
            const mid = from
                .clone()
                .add(to)
                .multiplyScalar(0.5)
                .normalize()
                .multiplyScalar(RADIUS * 1.32)

            const curve = new THREE.QuadraticBezierCurve3(from, mid, to)
            return new THREE.BufferGeometry().setFromPoints(curve.getPoints(64))
        })
    }, [])

    return (
        <>
            {arcs.map((g, i) => (
                <primitive key={i} object={new THREE.Line(g, new THREE.LineBasicMaterial({
                    color: i % 2 === 0 ? "#D4AF37" : "#5DBF95",
                    transparent: true,
                    opacity: 0.6,
                }))} />
            ))}
        </>
    )
}

/** Destination markers. Depth-tested, so they occlude behind the limb. */
function Markers() {
    return (
        <>
            {DESTINATIONS.map((d) => {
                const p = toVector3(d.lat, d.lon, RADIUS * 1.01)
                return (
                    <mesh key={d.id} position={p}>
                        <sphereGeometry args={[0.028, 12, 12]} />
                        <meshBasicMaterial color="#DFF0E7" />
                    </mesh>
                )
            })}
            <mesh position={toVector3(ORIGIN.lat, ORIGIN.lon, RADIUS * 1.01)}>
                <sphereGeometry args={[0.04, 14, 14]} />
                <meshBasicMaterial color="#D4AF37" />
            </mesh>
        </>
    )
}

function Scene({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
    const group = useRef<THREE.Group>(null)

    useFrame((_, delta) => {
        const g = group.current
        if (!g) return

        // Continuous slow rotation, framerate-independent via `delta` — on a
        // 120Hz display a per-frame constant would spin twice as fast.
        g.rotation.y += delta * 0.06

        // Damped pointer tilt. The globe leans toward the cursor rather than
        // tracking it, which keeps the motion calm.
        const target = pointer.current ?? { x: 0, y: 0 }
        g.rotation.x += (target.y * 0.22 - g.rotation.x) * 0.04
        g.position.x += (target.x * 0.12 - g.position.x) * 0.04
    })

    return (
        <group ref={group} rotation={[0.32, 0, 0.12]}>
            <GlobePoints />
            <Graticule />
            <FlightArcs />
            <Markers />

            {/* Atmosphere: a slightly larger sphere rendered back-face only.
                Cheaper than a fresnel shader and, at this opacity, identical
                to the eye. */}
            <mesh scale={1.16}>
                <sphereGeometry args={[RADIUS, 48, 48]} />
                <meshBasicMaterial
                    color="#2E9B72"
                    transparent
                    opacity={0.055}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}

export default function GlobeCanvas({
    pointer,
}: {
    pointer: React.RefObject<{ x: number; y: number }>
}) {
    return (
        <Canvas
            // DPR is capped at 1.5: beyond that a point cloud gains no visible
            // fidelity and costs fill rate on exactly the retina laptops most
            // likely to be running this.
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.6], fov: 42 }}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: "low-power",
            }}
            style={{ width: "100%", height: "100%" }}
        >
            <Scene pointer={pointer} />
        </Canvas>
    )
}
