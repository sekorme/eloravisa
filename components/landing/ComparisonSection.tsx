"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, X, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const comparisonData = [
  {
    feature: "Cost",
    agent: "High processing fees ($500+)",
    elora: "No processing fee",
    icon: Check
  },
  {
    feature: "Visa Interview Guide",
    agent: "No preparation/Generic tips",
    elora: "AI-Powered Mock Interviews",
    icon: Check
  },
  {
    feature: "Process",
    agent: "Apply for you (Black box)",
    elora: "Teach you to apply (Full Control)",
    icon: Check
  },
  {
    feature: "Transparency",
    agent: "Hide information/Gatekeep",
    elora: "Full transparency & Education",
    icon: Check
  },
  {
    feature: "Risk",
    agent: "High risk of misrepresentation",
    elora: "AI Document Review (Safety Net)",
    icon: Check
  },
  {
    feature: "Outcome",
    agent: "Dependent on agent's mood",
    elora: "Lifelong knowledge & skills",
    icon: Check
  }
]

export function ComparisonSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Three.js Background
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
    
    // Create floating "vs" particles or geometric shapes
    const group = new THREE.Group()
    scene.add(group)

    const particleCount = 20
    const particles: THREE.Mesh[] = []

    for (let i = 0; i < particleCount; i++) {
      const geometry = Math.random() > 0.5 
        ? new THREE.BoxGeometry(0.2, 0.2, 0.2)
        : new THREE.TetrahedronGeometry(0.2, 0)
        
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? (isDark ? 0xef4444 : 0xf87171) : (isDark ? 0x3b82f6 : 0x60a5fa),
        transparent: true,
        opacity: 0.15,
        wireframe: true
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5
      )
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      
      group.add(mesh)
      particles.push(mesh)
    }

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      
      particles.forEach((p, i) => {
        p.rotation.x += 0.005
        p.rotation.y += 0.005
        p.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002
      })

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
      particles.forEach(p => {
        p.geometry.dispose()
        ;(p.material as THREE.Material).dispose()
      })
      renderer.dispose()
    }
  }, [mounted, resolvedTheme])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(".comparison-title", {
        scrollTrigger: {
          trigger: ".comparison-title",
          start: "top 90%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      })

      gsap.from(".comparison-card", {
        scrollTrigger: {
          trigger: ".comparison-card",
          start: "top 95%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  if (!mounted) return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-slate-50/50 dark:bg-[#030308]/50 min-h-[600px]">
      <div className="container relative z-10 px-4 mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              What Makes Us{" "}
            </span>
            <span className="text-foreground">Different</span>
          </h2>
        </div>
      </div>
    </section>
  )

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 overflow-hidden bg-slate-50/50 dark:bg-[#030308]/50">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
      />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="comparison-title text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              What Makes Us{" "}
            </span>
            <span className="text-foreground">Different</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-xl">
            We don’t just process applications. We empower you with the tools and knowledge to succeed on your own.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 mb-6 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border font-bold text-lg hidden md:grid">
            <div className="col-span-4">Feature</div>
            <div className="col-span-4 text-center text-red-500">Traditional Agents</div>
            <div className="col-span-4 text-center text-blue-600 dark:text-blue-400">Elora Visa</div>
          </div>

          {/* Data Rows */}
          <div className="space-y-4">
            {comparisonData.map((item, index) => (
              <div 
                key={index} 
                className="comparison-card grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-6 md:py-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="col-span-1 md:col-span-4">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-blue-500 transition-colors">{item.feature}</h3>
                </div>
                
                <div className="col-span-1 md:col-span-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 md:bg-transparent">
                    <X className="w-5 h-5 text-red-500 shrink-0 md:hidden" />
                    <p className="text-muted-foreground md:text-center w-full">{item.agent}</p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 md:bg-blue-500/5 border border-blue-500/20 md:border-transparent group-hover:border-blue-500/30 transition-all">
                    <Check className="w-6 h-6 text-blue-500 shrink-0" />
                    <p className="font-semibold text-blue-700 dark:text-blue-300 md:text-center w-full">{item.elora}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
