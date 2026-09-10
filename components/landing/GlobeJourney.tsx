"use client"

import { useLayoutEffect, useRef, type ReactNode } from "react"
import dynamic from "next/dynamic"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { motion, useReducedMotion } from "motion/react"
import { prefersReducedMotion } from "@/lib/motion"
import { HeroGlobeFallback } from "./HeroGlobeFallback"

gsap.registerPlugin(ScrollTrigger)

const VisaGlobeCanvas = dynamic(() => import("./VisaGlobeCanvas").then((m) => m.VisaGlobeCanvas), {
  ssr: false,
  loading: () => <HeroGlobeFallback />,
})

/**
 * Wraps the hero and the section after it, and renders ONE globe that is
 * absolutely positioned over both. Two invisible "slots" mark where the globe
 * should sit: `[data-globe-slot="hero"]` inside the hero and
 * `[data-globe-slot="target"]` inside the next section. As the user scrolls,
 * a scrubbed ScrollTrigger moves and scales the globe from the first slot to
 * the second, so it visually flies out of the hero and lands on the next
 * section.
 */
export function GlobeJourney({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const globe = globeRef.current
    if (!wrapper || !globe) return

    const heroSlot = wrapper.querySelector<HTMLElement>('[data-globe-slot="hero"]')
    const targetSlot = wrapper.querySelector<HTMLElement>('[data-globe-slot="target"]')
    if (!heroSlot) return

    const measure = () => {
      const w = wrapper.getBoundingClientRect()
      const a = heroSlot.getBoundingClientRect()
      const b = (targetSlot ?? heroSlot).getBoundingClientRect()
      return {
        size: a.width,
        ax: a.left - w.left,
        ay: a.top - w.top,
        bx: b.left - w.left + b.width / 2 - a.width / 2,
        by: b.top - w.top + b.height / 2 - a.height / 2,
        s: b.width / a.width,
      }
    }

    const size = () => {
      const m = measure()
      gsap.set(globe, { width: m.size, height: m.size })
    }

    size()

    const ctx = gsap.context(() => {
      if (prefersReducedMotion() || !targetSlot) {
        const m = measure()
        gsap.set(globe, { x: m.ax, y: m.ay })
        return
      }

      gsap.fromTo(
        globe,
        { x: () => measure().ax, y: () => measure().ay, scale: 1 },
        {
          x: () => measure().bx,
          y: () => measure().by,
          scale: () => measure().s,
          ease: "none",
          immediateRender: true,
          scrollTrigger: {
            trigger: wrapper,
            start: "top top",
            endTrigger: targetSlot,
            end: "center center",
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        }
      )
    }, wrapper)

    ScrollTrigger.addEventListener("refreshInit", size)
    // Fonts / images settle after mount — make sure positions are fresh.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(raf)
      ScrollTrigger.removeEventListener("refreshInit", size)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      {children}

      <div
        ref={globeRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-30 will-change-transform"
      >
        <motion.div
          className="h-full w-full"
          initial={reduced ? false : { opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <VisaGlobeCanvas />
        </motion.div>
      </div>
    </div>
  )
}
