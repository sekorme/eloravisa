"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "../motion/useMotion"

/**
 * The capability gate in front of the Three.js globe.
 *
 * ------------------------------------------------------------------------
 * WHAT THIS PROTECTS
 * ------------------------------------------------------------------------
 * `three` + `@react-three/fiber` is a large dependency. Shipping it in the
 * initial bundle would hurt every Core Web Vital on the page for a decorative
 * enhancement, and would hurt worst on exactly the mid-range Android devices
 * many Elora applicants use.
 *
 * So the globe loads only when ALL of these hold:
 *
 *   1. `next/dynamic` with `ssr: false` — never server-rendered, never in the
 *      first-load JS.
 *   2. Viewport ≥ 1024px — below that the SVG horizon is the better design
 *      anyway, and the device is likelier to be power-constrained.
 *   3. `prefers-reduced-motion` is not set — a continuously rotating globe is
 *      precisely what that setting exists to stop.
 *   4. The device reports ≥ 4 CPU cores where the browser tells us.
 *   5. The page is idle (`requestIdleCallback`), so the download never competes
 *      with hydration or with the hero's entrance animation.
 *   6. The container is actually on screen (IntersectionObserver), and the
 *      canvas unmounts when it leaves — no GPU work for an offscreen globe.
 *
 * If any check fails, this renders nothing and the server-rendered SVG horizon
 * underneath remains the visual. That is not a fallback bolted on afterwards —
 * the SVG is the design, and this is the enhancement.
 */

const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), {
    ssr: false,
    // No loading spinner: the SVG horizon is already showing something
    // complete, and a spinner over it would be a downgrade.
    loading: () => null,
})

interface GlobeLayerProps {
    /** Minimum viewport width before 3D is considered worthwhile. */
    minWidth?: number
}

export function GlobeLayer({ minWidth = 1024 }: GlobeLayerProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const pointer = useRef({ x: 0, y: 0 })
    const [eligible, setEligible] = useState(false)
    const [visible, setVisible] = useState(false)
    const reduced = useReducedMotion()

    /* ------------------------------------------------- capability + idle -- */
    useEffect(() => {
        if (reduced) {
            setEligible(false)
            return
        }

        const check = () => {
            if (window.innerWidth < minWidth) return false
            // `deviceMemory`/`hardwareConcurrency` are advisory and absent in
            // Safari; absence is treated as "probably fine" rather than as a
            // reason to block.
            const cores = navigator.hardwareConcurrency
            if (typeof cores === "number" && cores < 4) return false
            return true
        }

        if (!check()) {
            setEligible(false)
            return
        }

        // Wait for idle so the 3D chunk never competes with hydration.
        const idle = window.requestIdleCallback
            ? window.requestIdleCallback(() => setEligible(true), { timeout: 2600 })
            : window.setTimeout(() => setEligible(true), 1800)

        const onResize = () => {
            if (!check()) setEligible(false)
        }
        window.addEventListener("resize", onResize, { passive: true })

        return () => {
            if (window.cancelIdleCallback && typeof idle === "number") {
                window.cancelIdleCallback(idle)
            } else {
                window.clearTimeout(idle as number)
            }
            window.removeEventListener("resize", onResize)
        }
    }, [minWidth, reduced])

    /* ------------------------------------------------------- visibility -- */
    useEffect(() => {
        const el = hostRef.current
        if (!el) return

        const io = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { rootMargin: "120px" }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    /* ---------------------------------------------------------- pointer -- */
    useEffect(() => {
        if (!eligible) return

        const onMove = (e: PointerEvent) => {
            pointer.current = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (e.clientY / window.innerHeight) * 2 - 1,
            }
        }

        window.addEventListener("pointermove", onMove, { passive: true })
        return () => window.removeEventListener("pointermove", onMove)
    }, [eligible])

    const active = eligible && visible

    return (
        <div
            ref={hostRef}
            className="eh-globe-layer"
            data-active={active ? "true" : "false"}
            // Purely decorative: the SVG horizon beneath carries the same
            // information, and the destination markers are real buttons
            // elsewhere in the scene.
            aria-hidden="true"
        >
            {active ? <GlobeCanvas pointer={pointer} /> : null}
        </div>
    )
}
