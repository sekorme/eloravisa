"use client"

import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/lib/motion"

interface TiltOptions {
    max?: number
    scale?: number
}

// 3D tilt-toward-cursor effect for cards. No-ops under
// prefers-reduced-motion so the element just sits still.
export function useTilt<T extends HTMLElement>({ max = 8, scale = 1.02 }: TiltOptions = {}) {
    const ref = useRef<T>(null)

    useEffect(() => {
        const el = ref.current
        if (!el || prefersReducedMotion()) return

        el.style.transition = "transform 0.15s ease-out"
        el.style.willChange = "transform"

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width - 0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5
            el.style.transform = `perspective(800px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale(${scale})`
        }

        const handleLeave = () => {
            el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)"
        }

        el.addEventListener("mousemove", handleMove)
        el.addEventListener("mouseleave", handleLeave)
        return () => {
            el.removeEventListener("mousemove", handleMove)
            el.removeEventListener("mouseleave", handleLeave)
        }
    }, [max, scale])

    return ref
}
