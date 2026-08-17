"use client"

import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/lib/motion"

// Nudges an element toward the cursor while hovered, snapping back on
// leave — the classic "magnetic button" effect. No-ops under
// prefers-reduced-motion.
export function useMagnetic<T extends HTMLElement>(strength = 0.3) {
    const ref = useRef<T>(null)

    useEffect(() => {
        const el = ref.current
        if (!el || prefersReducedMotion()) return

        el.style.transition = "transform 0.2s ease-out"
        el.style.willChange = "transform"

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect()
            const x = (e.clientX - rect.left - rect.width / 2) * strength
            const y = (e.clientY - rect.top - rect.height / 2) * strength
            el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
        }

        const handleLeave = () => {
            el.style.transform = "translate(0px, 0px)"
        }

        el.addEventListener("mousemove", handleMove)
        el.addEventListener("mouseleave", handleLeave)
        return () => {
            el.removeEventListener("mousemove", handleMove)
            el.removeEventListener("mouseleave", handleLeave)
        }
    }, [strength])

    return ref
}
