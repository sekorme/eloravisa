"use client"

import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "../motion/useMotion"

/**
 * A small readiness ring in the navigation bar that fills as the visitor
 * reads the homepage, reaching 100% at the final call to action, where it
 * pulses once.
 *
 * A scroll-progress indicator in the page's own vocabulary: the hero shows an
 * application-readiness ring, and this one quietly says "you're getting
 * ready" all the way down. Decorative, so `aria-hidden`.
 *
 * Progress is written straight to the DOM (a CSS custom property and the
 * number's text) on an rAF-throttled scroll listener, so scrolling never
 * re-renders React. The pulse plays once per page load; scrolling back up and
 * down again doesn't replay it.
 */

const R = 12
const C = 2 * Math.PI * R

export function ReadinessGauge() {
    const ref = useRef<HTMLSpanElement>(null)
    const numRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const reduced = prefersReducedMotion()
        let raf = 0
        let done = false

        const update = () => {
            raf = 0
            const final = document.querySelector<HTMLElement>(".eh-final")
            const doc = document.documentElement
            // Full when the final CTA sits in the middle of the viewport (or at
            // the very bottom of the page, whichever comes first).
            const finish = final
                ? final.getBoundingClientRect().top + window.scrollY + final.offsetHeight / 2 - window.innerHeight / 2
                : doc.scrollHeight - window.innerHeight
            const end = Math.max(1, Math.min(finish, doc.scrollHeight - window.innerHeight))
            const p = Math.min(1, Math.max(0, window.scrollY / end))
            el.style.setProperty("--eh-gauge", p.toFixed(4))
            if (numRef.current) numRef.current.textContent = String(Math.round(p * 100))
            if (!done && p >= 0.999) {
                done = true
                if (!reduced) el.dataset.done = "true"
            }
        }
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }

        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            cancelAnimationFrame(raf)
        }
    }, [])

    return (
        <span ref={ref} className="eh-gauge" aria-hidden="true" title="Readiness: how far through the page you are">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r={R} className="eh-gauge-track" strokeWidth="2.5" />
                <circle
                    cx="16"
                    cy="16"
                    r={R}
                    className="eh-gauge-fill"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    style={{ strokeDashoffset: `calc(${C} * (1 - var(--eh-gauge, 0)))` }}
                    transform="rotate(-90 16 16)"
                />
            </svg>
            <span ref={numRef} className="eh-gauge-num">
                0
            </span>
        </span>
    )
}
