"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { QuadraticBezierLine } from "@react-three/drei"
import * as THREE from "three"
import { motion } from "motion/react"
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
  { from: [40, -74], to: [51, 0], color: "#22D3EE" },
  { from: [51, 0], to: [25, 55], color: "#2563EB" },
  { from: [25, 55], to: [1, 103], color: "#7C3AED" },
  { from: [6, 3], to: [51, 0], color: "#EC16D7" },
  { from: [43, -79], to: [52, 13], color: "#22D3EE" },
]

function arcPoints(route: (typeof ROUTES)[number]) {
  const start = pointOnSphere(RADIUS + 0.01, route.from[0], route.from[1])
  const end = pointOnSphere(RADIUS + 0.01, route.to[0], route.to[1])
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + 0.55)
  return { start, end, mid }
}

function DotSphere() {
  const positions = useMemo(() => {
    const count = 700
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
      <pointsMaterial size={0.02} color="#5eead4" transparent opacity={0.5} sizeAttenuation />
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
            lineWidth={1.2}
            transparent
            opacity={0.7}
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
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#22D3EE" />
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
      p.t = (p.t + delta * p.speed) % 1
      const a = p.start.clone().lerp(p.mid, p.t)
      const b = p.mid.clone().lerp(p.end, p.t)
      mesh.position.copy(a.lerp(b, p.t))
    })
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.017, 6, 6]} />
          <meshBasicMaterial color={p.color} />
        </mesh>
      ))}
    </group>
  )
}

function Atmosphere() {
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[RADIUS, 32, 32]} />
      <meshBasicMaterial color="#2563EB" transparent opacity={0.08} side={THREE.BackSide} depthWrite={false} />
    </mesh>
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
    group.rotation.y += delta * 0.09
    if (interactive) {
      group.rotation.x += (pointer.current.y * 0.15 - group.rotation.x) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      <Atmosphere />
      <DotSphere />
      <Routes />
      <RouteMarkers />
      <RouteParticles />
    </group>
  )
}

function FloatingPassportCard() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-2 md:translate-x-0 w-40 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md p-3 shadow-2xl"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="h-1.5 w-10 rounded-full bg-gradient-to-r from-landing-cyan to-landing-magenta mb-2" />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/90">Preparation status</p>
      <p className="text-[9px] text-white/50 mt-1">Documents · Interview · Checklist</p>
    </motion.div>
  )
}

function RouteLabels() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
      <span className="absolute top-[18%] left-[8%] text-[10px] font-medium uppercase tracking-widest text-landing-cyan/80">
        Study routes
      </span>
      <span className="absolute bottom-[22%] right-[6%] text-[10px] font-medium uppercase tracking-widest text-landing-magenta/80">
        Work &amp; visit routes
      </span>
    </div>
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

export function VisaGlobeCanvas() {
  const [capability, setCapability] = useState<"pending" | "canvas" | "fallback">("pending")

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    const reduced = prefersReducedMotion()
    setCapability(!isMobile && !reduced && detectWebGL() ? "canvas" : "fallback")
  }, [])

  if (capability !== "canvas") {
    return <HeroGlobeFallback />
  }

  return (
    <div className="relative w-full h-full min-h-[320px]" aria-hidden="true">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.4], fov: 42 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.7} />
        <GlobeGroup interactive={detectInteractive()} />
      </Canvas>
      <FloatingPassportCard />
      <RouteLabels />
    </div>
  )
}
