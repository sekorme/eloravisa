"use client"

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function FlyingObject({ position, speed, color, scale }: { position: [number, number, number], speed: number, color: string, scale: number }) {
  const mesh = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    mesh.current.rotation.x = t
    mesh.current.rotation.y = t / 1.5
    mesh.current.position.y = position[1] + Math.sin(t) * 2
  })

  // Randomly choose a geometry
  const geometryType = useMemo(() => Math.floor(Math.random() * 3), [])

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      {geometryType === 0 ? <boxGeometry args={[1, 1, 1]} /> : 
       geometryType === 1 ? <sphereGeometry args={[0.7, 16, 16]} /> : 
       <octahedronGeometry args={[0.8]} />}
      <meshStandardMaterial color={color} transparent opacity={0.4} wireframe />
    </mesh>
  )
}

function AnimatedPattern() {
  const ref = useRef<THREE.Points>(null!)
  
  // Create random sphere points with colors
  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(5000 * 3)
    const c = new Float32Array(5000 * 3)
    const colorOptions = [
      new THREE.Color("#4f46e5"), // Indigo
      new THREE.Color("#ec4899"), // Pink
      new THREE.Color("#06b6d4"), // Cyan
      new THREE.Color("#8b5cf6"), // Violet
    ]

    for (let i = 0; i < 5000; i++) {
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 12 + Math.random() * 5
      
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      p[i * 3 + 2] = r * Math.cos(phi)

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      c[i * 3] = color.r
      c[i * 3 + 1] = color.g
      c[i * 3 + 2] = color.b
    }
    return { positions: p, colors: c }
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15
      ref.current.rotation.y -= delta / 20
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.5}
        />
      </Points>
    </group>
  )
}

export function AffiliateBackground() {
  const objects = useMemo(() => {
    const o = []
    const colors = ["#4f46e5", "#ec4899", "#06b6d4", "#8b5cf6", "#f59e0b"]
    for (let i = 0; i < 15; i++) {
      o.push({
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ] as [number, number, number],
        speed: 0.2 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random() * 1.5
      })
    }
    return o
  }, [])

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 dark:opacity-40 h-full w-full">
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AnimatedPattern />
        {objects.map((obj, i) => (
          <Float key={i} speed={obj.speed * 2} rotationIntensity={2} floatIntensity={2}>
            <FlyingObject {...obj} />
          </Float>
        ))}
      </Canvas>
    </div>
  )
}
