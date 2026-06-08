"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate blobs with more complex paths
      gsap.to(".blob-1", {
        x: "15vw",
        y: "10vh",
        scale: 1.2,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      gsap.to(".blob-2", {
        x: "-10vw",
        y: "15vh",
        scale: 0.8,
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      })

      gsap.to(".blob-3", {
        x: "5vw",
        y: "-12vh",
        scale: 1.1,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      })

      gsap.to(".blob-4", {
        x: "-5vw",
        y: "-5vh",
        scale: 1.3,
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 3,
      })

      // Subtle rotation for the whole container to give a sense of movement
      gsap.to(".bg-gradient-mesh", {
        rotation: 360,
        duration: 100,
        repeat: -1,
        ease: "none",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Mesh Gradient Base - removed opaque background */}
      
      {/* Animated Gradient Mesh */}
      <div className="bg-gradient-mesh absolute -inset-[100%] opacity-50 dark:opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.2)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(192,132,252,0.2)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_50%)]" />
        <div className="absolute bottom-1/4 right-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.15)_0%,transparent_50%)]" />
      </div>

      {/* Grid Pattern */}
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.15}
        duration={5}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 opacity-40 dark:opacity-30"
        )}
      />

      {/* Organic Blobs - Softened but more visible */}
      <div className="blob-1 absolute top-[5%] left-[5%] w-[45vw] h-[45vw] min-w-[400px] min-h-[400px] bg-blue-400/30 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px]" />
      <div className="blob-2 absolute top-[30%] right-[5%] w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-purple-400/30 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px]" />
      <div className="blob-3 absolute bottom-[5%] left-[20%] w-[50vw] h-[50vw] min-w-[450px] min-h-[450px] bg-cyan-400/30 dark:bg-cyan-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px]" />
      <div className="blob-4 absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] bg-pink-400/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px]" />

      {/* Extra highlights */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </div>
  )
}
