"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { QuadraticBezierLine } from "@react-three/drei"
import * as THREE from "three"
import { prefersReducedMotion } from "@/lib/motion"
import { HeroGlobeFallback } from "./HeroGlobeFallback"

const RADIUS = 1.6

function pointOnSphere(radius: number, latDeg: number, lonDeg: number) {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon)
  )
}

// Generic route pairs for visual variety — not a claim about specific
// supported destinations (see homepage copy for actual supported scope).
const ROUTES: { from: [number, number]; to: [number, number]; color: string }[] = [
  { from: [40, -74], to: [51, 0], color: "#7dd3fc" },
  { from: [51, 0], to: [25, 55], color: "#93c5fd" },
  { from: [25, 55], to: [1, 103], color: "#c4b5fd" },
  { from: [6, 3], to: [51, 0], color: "#f9a8d4" },
  { from: [43, -79], to: [52, 13], color: "#7dd3fc" },
]

function arcPoints(route: (typeof ROUTES)[number]) {
  const start = pointOnSphere(RADIUS + 0.01, route.from[0], route.from[1])
  const end = pointOnSphere(RADIUS + 0.01, route.to[0], route.to[1])
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + 0.55)
  return { start, end, mid }
}

/** Solid planet body so the dot-grid reads as a globe on light backgrounds. */
function PlanetBody() {
  return (
    <mesh>
      <sphereGeometry args={[RADIUS - 0.02, 48, 48]} />
      <meshStandardMaterial color="#123561" roughness={0.45} metalness={0.1} />
    </mesh>
  )
}

function DotSphere() {
  const positions = useMemo(() => {
    const count = 900
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = Math.PI * (3 - Math.sqrt(5)) * i
      arr[i * 3] = Math.cos(theta) * r * RADIUS
      arr[i * 3 + 1] = y * RADIUS
      arr[i * 3 + 2] = Math.sin(theta) * r * RADIUS
    }
    return arr
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.026} color="#e0ecff" transparent opacity={0.95} sizeAttenuation />
    </points>
  )
}

function Routes() {
  return (
    <>
      {ROUTES.map((route, i) => {
        const { start, end, mid } = arcPoints(route)
        return (
          <QuadraticBezierLine
            key={i}
            start={start}
            end={end}
            mid={mid}
            color={route.color}
            lineWidth={1.4}
            transparent
            opacity={0.9}
          />
        )
      })}
    </>
  )
}

function RouteMarkers() {
  const markers = useMemo(
    () => ROUTES.flatMap((route) => [route.from, route.to]).map((coord) => pointOnSphere(RADIUS + 0.015, coord[0], coord[1])),
    []
  )

  return (
    <>
      {markers.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </>
  )
}

function RouteParticles() {
  const groupRef = useRef<THREE.Group>(null)
  const particles = useMemo(
    () =>
      ROUTES.map((route, i) => ({
        ...arcPoints(route),
        t: (i / ROUTES.length) * 0.8,
        speed: 0.15 + (i % 3) * 0.05,
        color: route.color,
      })),
    []
  )

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    group.children.forEach((mesh, i) => {
      const p = particles[i]
      p.t = (p.t + Math.min(delta, 0.05) * p.speed) % 1
      const a = p.start.clone().lerp(p.mid, p.t)
      const b = p.mid.clone().lerp(p.end, p.t)
      mesh.position.copy(a.lerp(b, p.t))
    })
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

function Atmosphere() {
  return (
    <group>
      {/* Kept inside the camera frustum (half-height ≈ 1.69 at z=0) so its silhouette isn't clipped by the canvas edge. */}
      <mesh scale={1.04}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Rim highlight so the sphere reads as lit glass rather than a flat disc */}
      <mesh scale={1.01}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial color="#bfdbfe" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

function GlobeGroup({ interactive }: { interactive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!interactive) return
    const handleMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("pointermove", handleMove)
    return () => window.removeEventListener("pointermove", handleMove)
  }, [interactive])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    group.rotation.y += Math.min(delta, 0.05) * 0.045
    if (interactive) {
      group.rotation.x += (pointer.current.y * 0.08 - group.rotation.x) * 0.03
    }
  })

  return (
    <group ref={groupRef} rotation={[0.25, 0, -0.1]}>
      <Atmosphere />
      <PlanetBody />
      <DotSphere />
      <Routes />
      <RouteMarkers />
      <RouteParticles />
    </group>
  )
}

function detectInteractive() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
}

function detectWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
  } catch {
    return false
  }
}

/**
 * Transparent, square 3D globe. Sized by its parent (use `aspect-square`).
 * Falls back to a static SVG on mobile, reduced-motion, or without WebGL.
 */
function detectCapability(): "canvas" | "fallback" {
  if (typeof window === "undefined") return "fallback"
  const isMobile = window.matchMedia("(max-width: 767px)").matches
  return !isMobile && !prefersReducedMotion() && detectWebGL() ? "canvas" : "fallback"
}

export function VisaGlobeCanvas({ active = true }: { active?: boolean }) {
  // Loaded with `ssr: false`, so the initializer runs in the browser.
  const [capability] = useState(detectCapability)

  if (capability !== "canvas") {
    return <HeroGlobeFallback />
  }

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div className="absolute -inset-[10%] bg-[radial-gradient(circle_at_50%_50%,rgba(96,165,250,0.45),rgba(30,108,240,0.12)_45%,transparent_68%)]" />
      <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.5]} camera={{ position: [0, 0, 5.5], fov: 42 }} gl={{ alpha: true, antialias: true }} fallback={<HeroGlobeFallback />}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[-3, 3, 4]} intensity={2} color="#ffffff" />
        <directionalLight position={[4, -2, -3]} intensity={0.8} color="#a78bfa" />
        <hemisphereLight args={["#dbeafe", "#0b2343", 0.8]} />
        <GlobeGroup interactive={detectInteractive()} />
      </Canvas>
    </div>
  )
}
