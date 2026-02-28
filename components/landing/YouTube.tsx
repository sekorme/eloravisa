"use client"

import React, { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function YouTube() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


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
