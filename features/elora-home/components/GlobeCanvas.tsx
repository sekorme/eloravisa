"use client"

import { useMemo, useRef, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Line } from "@react-three/drei"
import * as THREE from "three"
import { DESTINATIONS, ORIGIN } from "../data/destinations"
import { LAND_DENSE } from "../data/globeLandDense"
import { greatCircle, type View } from "./globeGeo"

/**
 * The Three.js globe for the destination scene — the only place this project
 * uses Three.js, loaded lazily behind the gate in `GlobeLayer`.
 *
 * It draws the same world as the SVG globe beneath it (`Horizon`) and is
 * driven by the same `view`, so when it fades in over the SVG nothing jumps:
 * dotted continents, flight routes from Accra, the selected route in gold
 * with a light travelling along it, and labels that hide as their country
 * turns away round the limb.
 *
 * Cheap on purpose: one point cloud, a handful of lines and two tiny
 * shaders; no textures beyond a 64px dot, no post-processing, DPR capped.
 */

const RADIUS = 1.6
/** Camera distance chosen so the sphere's silhouette matches the SVG disc. */
const CAMERA_Z = 5.62

/** Lat/lon (degrees) to a point on a sphere of radius `r`. */
function toVector3(lat: number, lon: number, r: number): THREE.Vector3 {
    const φ = (90 - lat) * (Math.PI / 180)
    const θ = (lon + 180) * (Math.PI / 180)
    return new THREE.Vector3(-r * Math.sin(φ) * Math.cos(θ), r * Math.cos(φ), r * Math.sin(φ) * Math.sin(θ))
}

/** Group rotation that brings `view` to the centre of the disc, north up. */
function rotationFor(view: View): { x: number; y: number } {
    const lon = (view.lon * Math.PI) / 180
    return { y: -Math.atan2(Math.cos(lon), -Math.sin(lon)), x: (view.lat * Math.PI) / 180 }
}

const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** A soft round sprite, drawn once. */
function useDotTexture(soft = false) {
    return useMemo(() => {
        const c = document.createElement("canvas")
        c.width = c.height = 64
        const g = c.getContext("2d")!
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
        if (soft) {
            grad.addColorStop(0, "rgba(255,244,214,1)")
            grad.addColorStop(0.3, "rgba(232,199,102,0.75)")
            grad.addColorStop(1, "rgba(212,175,55,0)")
        } else {
            grad.addColorStop(0, "rgba(255,255,255,1)")
            grad.addColorStop(0.6, "rgba(255,255,255,1)")
            grad.addColorStop(1, "rgba(255,255,255,0)")
        }
        g.fillStyle = grad
        g.fillRect(0, 0, 64, 64)
        const t = new THREE.CanvasTexture(c)
        t.colorSpace = THREE.SRGBColorSpace
        return t
    }, [soft])
}

/* ------------------------------------------------------------------ parts */

function Body() {
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                uniforms: {
                    light: { value: new THREE.Vector3(-0.55, 0.6, 0.6).normalize() },
                },
                vertexShader: /* glsl */ `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }`,
                fragmentShader: /* glsl */ `
                    uniform vec3 light;
                    varying vec3 vNormal;
                    void main() {
                        float l = clamp(dot(vNormal, light) * 0.5 + 0.5, 0.0, 1.0);
                        vec3 dark = vec3(0.012, 0.055, 0.043);
                        vec3 lit = vec3(0.12, 0.33, 0.27);
                        gl_FragColor = vec4(mix(dark, lit, pow(l, 1.6)), 1.0);
                    }`,
            }),
        []
    )
    return (
        <mesh material={material}>
            <sphereGeometry args={[RADIUS, 64, 64]} />
        </mesh>
    )
}

function Atmosphere() {
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: /* glsl */ `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }`,
                fragmentShader: /* glsl */ `
                    varying vec3 vNormal;
                    void main() {
                        float rim = clamp(pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4), 0.0, 1.0);
                        gl_FragColor = vec4(0.42, 0.80, 0.63, rim * 0.75);
                    }`,
                side: THREE.BackSide,
                blending: THREE.NormalBlending,
                transparent: true,
                depthWrite: false,
            }),
        []
    )
    return (
        <mesh material={material} scale={1.1}>
            <sphereGeometry args={[RADIUS, 48, 48]} />
        </mesh>
    )
}

function Land() {
    const map = useDotTexture()
    const geometry = useMemo(() => {
        const n = LAND_DENSE.length / 2
        const pos = new Float32Array(n * 3)
        for (let i = 0; i < n; i++) {
            const v = toVector3(LAND_DENSE[i * 2] / 10, LAND_DENSE[i * 2 + 1] / 10, RADIUS * 1.004)
            pos.set([v.x, v.y, v.z], i * 3)
        }
        const g = new THREE.BufferGeometry()
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
        return g
    }, [])
    return (
        <points geometry={geometry}>
            <pointsMaterial map={map} size={0.03} color="#9FD8BD" transparent opacity={0.85} alphaTest={0.3} sizeAttenuation depthWrite={false} />
        </points>
    )
}

function Graticule() {
    const lines = useMemo(() => {
        const mat = new THREE.LineBasicMaterial({ color: "#8FCDAF", transparent: true, opacity: 0.08 })
        const out: THREE.Line[] = []
        for (let lat = -60; lat <= 60; lat += 30) {
            const pts: THREE.Vector3[] = []
            for (let lon = -180; lon <= 180; lon += 4) pts.push(toVector3(lat, lon, RADIUS * 1.001))
            out.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat))
        }
        for (let lon = -180; lon < 180; lon += 30) {
            const pts: THREE.Vector3[] = []
            for (let lat = -84; lat <= 84; lat += 4) pts.push(toVector3(lat, lon, RADIUS * 1.001))
            out.push(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat))
        }
        return out
    }, [])
    return (
        <>
            {lines.map((l, i) => (
                <primitive key={i} object={l} />
            ))}
        </>
    )
}

/** Arc points for every destination, computed once. */
function useArcs() {
    return useMemo(
        () =>
            Object.fromEntries(
                DESTINATIONS.map((d) => [
                    d.id,
                    greatCircle(ORIGIN, d, 64).map((p) => toVector3(p.lat, p.lon, RADIUS * (1 + p.lift))),
                ])
            ) as Record<string, THREE.Vector3[]>,
        []
    )
}

/**
 * The selected route only. Faint routes to the other destinations were tried
 * and dropped: lifted arcs stay visible past the limb, so the ones running
 * round the back read as stray lines. The other destinations stay as dots.
 */
function Routes({ selectedId }: { selectedId: string }) {
    const arcs = useArcs()
    const pts = arcs[selectedId]
    if (!pts) return null
    return (
        <>
            <Line points={pts} color="#D4AF37" lineWidth={7} transparent opacity={0.22} depthWrite={false} />
            <Line points={pts} color="#E8C766" lineWidth={2.2} />
            <Comet points={pts} />
        </>
    )
}

/** A light travelling along the selected route. */
function Comet({ points }: { points: THREE.Vector3[] }) {
    const ref = useRef<THREE.Sprite>(null)
    const map = useDotTexture(true)
    const start = useRef<number | null>(null)
    useFrame(({ clock }) => {
        const s = ref.current
        if (!s) return
        if (start.current === null) start.current = clock.elapsedTime
        const t = ((clock.elapsedTime - start.current) % 2.8) / 2.8
        const f = t * (points.length - 1)
        const i = Math.floor(f)
        s.position.lerpVectors(points[i], points[Math.min(points.length - 1, i + 1)], f - i)
        // Fade in at take-off and out on landing.
        ;(s.material as THREE.SpriteMaterial).opacity = Math.min(1, t * 8, (1 - t) * 8)
    })
    return (
        <sprite ref={ref} scale={0.2}>
            <spriteMaterial map={map} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
    )
}

function Markers({ selectedId }: { selectedId: string }) {
    const ring = useRef<THREE.Mesh>(null)
    const selected = DESTINATIONS.find((d) => d.id === selectedId)
    const ringPos = useMemo(() => (selected ? toVector3(selected.lat, selected.lon, RADIUS * 1.006) : null), [selected])

    useFrame(({ clock }) => {
        const m = ring.current
        if (!m) return
        const t = (clock.elapsedTime % 1.8) / 1.8
        m.scale.setScalar(1 + t * 1.6)
        ;(m.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t)
    })

    return (
        <>
            {DESTINATIONS.map((d) => {
                const on = d.id === selectedId
                return (
                    <mesh key={d.id} position={toVector3(d.lat, d.lon, RADIUS * 1.008)}>
                        <sphereGeometry args={[on ? 0.034 : 0.022, 16, 16]} />
                        <meshBasicMaterial color={on ? "#E8C766" : "#DFF0E7"} />
                    </mesh>
                )
            })}
            {ringPos && (
                <mesh
                    ref={ring}
                    position={ringPos}
                    // Face outward from the globe's centre.
                    onUpdate={(m) => m.lookAt(ringPos.clone().multiplyScalar(2))}
                >
                    <ringGeometry args={[0.045, 0.058, 32]} />
                    <meshBasicMaterial color="#E8C766" transparent side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            )}
            <mesh position={toVector3(ORIGIN.lat, ORIGIN.lon, RADIUS * 1.008)}>
                <sphereGeometry args={[0.036, 16, 16]} />
                <meshBasicMaterial color="#D4AF37" />
            </mesh>
        </>
    )
}

/* ------------------------------------------------------------------ scene */

type LabelMap = RefObject<Record<string, HTMLElement | null>>

const LABEL_POINTS = [
    ...DESTINATIONS.map((d) => ({ id: d.id, pos: toVector3(d.lat, d.lon, RADIUS * 1.01) })),
    { id: "origin", pos: toVector3(ORIGIN.lat, ORIGIN.lon, RADIUS * 1.01) },
]

/** Positions the HTML labels over their markers; hides them round the back. */
function placeLabels(
    map: Record<string, HTMLElement | null>,
    g: THREE.Group,
    camera: THREE.Camera,
    size: { width: number; height: number },
    tmp: THREE.Vector3
) {
    for (const { id, pos } of LABEL_POINTS) {
        const el = map[id]
        if (!el) continue
        tmp.copy(pos).applyMatrix4(g.matrixWorld)
        const facing = tmp.z / RADIUS
        tmp.project(camera)
        const x = ((tmp.x + 1) / 2) * size.width
        const y = ((1 - tmp.y) / 2) * size.height
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        const vis = Math.max(0, Math.min(1, (facing - 0.12) / 0.2))
        el.style.opacity = vis.toFixed(2)
        el.style.pointerEvents = vis > 0.5 ? "auto" : "none"
    }
}

function Scene({
    viewRef,
    pointer,
    selectedId,
    labels,
    onReady,
}: {
    viewRef: RefObject<View>
    pointer: RefObject<{ x: number; y: number }>
    selectedId: string
    labels: LabelMap
    onReady: () => void
}) {
    const group = useRef<THREE.Group>(null)
    const { camera, size } = useThree()
    const tmp = useMemo(() => new THREE.Vector3(), [])
    const initialised = useRef(false)

    useFrame(({ clock }, delta) => {
        const g = group.current
        if (!g) return
        const target = rotationFor(viewRef.current)
        const p = pointer.current ?? { x: 0, y: 0 }
        // A gentle idle sway and a small lean toward the pointer, on top of
        // the view. The view itself already animates, so damping is light.
        const ty = target.y + Math.sin(clock.elapsedTime * 0.25) * 0.035 + p.x * 0.06
        const tx = target.x + p.y * 0.05
        if (!initialised.current) {
            g.rotation.set(tx, ty, 0)
            initialised.current = true
            // Tell the layer a real frame exists, so it can crossfade from
            // the SVG without ever showing an empty canvas.
            requestAnimationFrame(onReady)
        } else {
            // Time-based, so a slow device lands in the same place, just less
            // smoothly.
            const k = 1 - Math.exp(-delta * 9)
            g.rotation.y += wrapAngle(ty - g.rotation.y) * k
            g.rotation.x += (tx - g.rotation.x) * k
        }
        g.updateMatrixWorld()

        if (labels.current) placeLabels(labels.current, g, camera, size, tmp)
    })

    return (
        <group ref={group}>
            <Body />
            <Graticule />
            <Land />
            <Routes selectedId={selectedId} />
            <Markers selectedId={selectedId} />
            <Atmosphere />
        </group>
    )
}

export default function GlobeCanvas({
    pointer,
    viewRef,
    selectedId,
    onSelect,
    onReady,
}: {
    pointer: RefObject<{ x: number; y: number }>
    viewRef: RefObject<View>
    selectedId: string
    onSelect: (id: string) => void
    onReady: () => void
}) {
    const labels = useRef<Record<string, HTMLElement | null>>({})

    return (
        <div className="eh-globe3d">
            <Canvas
                // DPR capped at 1.5: beyond that a dot globe gains nothing visible
                // and costs fill rate on exactly the laptops likely to run this.
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, CAMERA_Z], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
                style={{ width: "100%", height: "100%" }}
            >
                <Scene viewRef={viewRef} pointer={pointer} selectedId={selectedId} labels={labels} onReady={onReady} />
            </Canvas>

            {/* Mirrors the destination buttons below the globe, which remain the
                accessible control; these are a pointer convenience. */}
            <div className="eh-globe3d-labels" aria-hidden="true">
                {DESTINATIONS.map((d) => (
                    <button
                        key={d.id}
                        type="button"
                        tabIndex={-1}
                        ref={(el) => {
                            labels.current[d.id] = el
                        }}
                        className="eh-globe3d-label"
                        data-selected={d.id === selectedId ? "true" : "false"}
                        onClick={() => onSelect(d.id)}
                        style={{ opacity: 0 }}
                    >
                        <span className="eh-globe3d-hit" />
                        <span className="eh-globe3d-text">{d.id === selectedId ? d.name : d.code}</span>
                    </button>
                ))}
                <span
                    ref={(el) => {
                        labels.current.origin = el
                    }}
                    className="eh-globe3d-label eh-globe3d-origin"
                    style={{ opacity: 0 }}
                >
                    <span className="eh-globe3d-text">Accra</span>
                </span>
            </div>
        </div>
    )
}
