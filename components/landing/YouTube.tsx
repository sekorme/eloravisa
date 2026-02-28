"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function YouTube() {
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
    
    // Create animated background elements (floating rings)
    const ringsGroup = new THREE.Group()
    scene.add(ringsGroup)

    const ringCount = 8
    const rings: THREE.Mesh[] = []

    for (let i = 0; i < ringCount; i++) {
      const geometry = new THREE.TorusGeometry(
        1.5 + i * 0.4, 
        0.015, 
        16, 
        100
      )
      const material = new THREE.MeshBasicMaterial({
        color: isDark ? 0x00b7fa : 0xff1cf7,
        transparent: true,
        opacity: 0.1 - (i * 0.01)
      })
      const ring = new THREE.Mesh(geometry, material)
      
      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI
      
      ringsGroup.add(ring)
      rings.push(ring)
    }

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      
      rings.forEach((ring, i) => {
        ring.rotation.x += 0.001 * (i + 1) * 0.2
        ring.rotation.y += 0.002 * (i + 1) * 0.2
      })

      renderer.render(scene, camera)
    }
    animate()

    // Handle Resize
    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    // Parallax effect on scroll
    const scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
            ringsGroup.position.y = self.progress * 2 - 1
            ringsGroup.rotation.z = self.progress * Math.PI * 0.2
        }
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
      scrollTrigger.kill()
      rings.forEach(ring => {
        ring.geometry.dispose()
        ;(ring.material as THREE.Material).dispose()
      })
      renderer.dispose()
    }
  }, [mounted, resolvedTheme])

  useEffect(() => {
    if (!mounted || !containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(".youtube-header", {
        scrollTrigger: {
          trigger: ".youtube-header",
          start: "top 85%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      })

      gsap.from(".video-container", {
        scrollTrigger: {
          trigger: ".video-container",
          start: "top 80%",
        },
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  return (
    <section ref={containerRef} className="relative py-24 overflow-hidden">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-60"
      />

      <div className="container relative z-10 px-4 mx-auto text-center">
        <div className="youtube-header mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent">
              Watch{" "}
            </span>
            <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
              Tutorial
            </span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#FF1CF7] to-[#00b7fa] mx-auto rounded-full mb-6"></div>
          <p className="max-w-2xl mx-auto text-muted-foreground text-xl">
            Take a deep dive into EloraVisa. See exactly how our platform empowers you to take full control of your visa application.
          </p>
        </div>

        <div className="video-container max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] border-8 border-white dark:border-slate-900 group relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/OhV11JYsiWw?si=U4NrAz0jZMQabq3x"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="relative z-10"
          ></iframe>
        </div>
      </div>
    </section>
  )
}
