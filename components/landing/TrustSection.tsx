"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { ShieldCheck, Info, Lock } from "lucide-react"

export function TrustSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.z = 5

    const isDark = resolvedTheme === "dark"
    
    // Create floating "trust nodes" (simple particles)
    const particleCount = 30
    const particlesGroup = new THREE.Group()
    scene.add(particlesGroup)

    const geometry = new THREE.SphereGeometry(0.05, 8, 8)
    const material = new THREE.MeshBasicMaterial({
        color: isDark ? 0x22c55e : 0x16a34a,
        transparent: true,
        opacity: 0.2
    })

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(geometry, material)
        particle.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        )
        particlesGroup.add(particle)
    }

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      particlesGroup.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [mounted, resolvedTheme])

  return (
    <section ref={containerRef} className="relative py-16 bg-white dark:bg-[#020205] border-y border-slate-200 dark:border-slate-800 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Improve Success Rate</h3>
                    <p className="text-sm text-muted-foreground">Expertly crafted strategies based on successful application patterns.</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Info className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Educational Guidance</h3>
                    <p className="text-sm text-muted-foreground">We empower you with knowledge. You remain the owner of your application.</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">Your sensitive data is encrypted and never shared with unauthorized parties.</p>
                </div>
            </div>
            
            <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-8">
                <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-70">
                    <span className="font-semibold block mb-2 uppercase tracking-widest">Legal Disclaimer</span>
                    EloraVisa is not a law firm and does not provide legal advice. We are not affiliated with any government agency or embassy. Our services provide self-help guidance and AI-powered document reviews at your specific direction.
                </p>
            </div>
        </div>
      </div>
    </section>
  )
}
