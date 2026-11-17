"use client"

import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "../motion/useMotion"

/**
 * Departure-board (split-flap) text.
 *
 * Each character cycles through random glyphs and settles into place, left to
 * right, the way a Solari board updates. It runs once when the text first
 * scrolls into view, and again whenever the text changes (e.g. picking a
 * different destination).
 *
 * The real text is always in the HTML: it renders as plain text on the server,
 * screen readers get it from a visually hidden copy, and the animated copy is
 * `aria-hidden` so the random glyphs are never announced. No JS, reduced
 * motion, or a closed animation gate all simply show the final text.
 *
 * The animated span is keyed on the text, so when the text changes React
 * mounts a fresh node rather than updating one whose contents we've written
 * to directly.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
/** ms between each character starting to settle. */
const STEP = 32
/** ms every character spends flipping before it can settle. */
const SPIN = 240
/** ms between glyph changes on an unsettled character. */
const TICK = 55

export function FlapText({ text, className = "" }: { text: string; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null)
    const seen = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (prefersReducedMotion()) return
        if (document.documentElement.dataset.ehAnim !== "ready") return

        let raf = 0
        let start = 0
        let lastTick = 0

        const frame = (now: number) => {
            if (!start) start = now
            const elapsed = now - start
            if (now - lastTick < TICK && elapsed < SPIN + text.length * STEP) {
                raf = requestAnimationFrame(frame)
                return
            }
            lastTick = now

            let out = ""
            let done = true
            for (let i = 0; i < text.length; i++) {
                const ch = text[i]
                // Spaces and punctuation are the board's fixed separators.
                if (!/[a-z0-9]/i.test(ch) || elapsed >= SPIN + i * STEP) {
                    out += ch
                } else {
                    out += GLYPHS[(Math.random() * GLYPHS.length) | 0]
                    done = false
                }
            }
            el.textContent = out
            if (!done) raf = requestAnimationFrame(frame)
        }

        const run = () => {
            cancelAnimationFrame(raf)
            start = 0
            lastTick = 0
            raf = requestAnimationFrame(frame)
        }

        // A text change after the first reveal flips immediately.
        if (seen.current) {
            run()
            return () => cancelAnimationFrame(raf)
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                io.disconnect()
                seen.current = true
                run()
            },
            { rootMargin: "0px 0px -12% 0px" }
        )
        io.observe(el)

        return () => {
            io.disconnect()
            cancelAnimationFrame(raf)
            // Never leave a half-flipped string behind.
            el.textContent = text
        }
    }, [text])

    return (
        <span className={`eh-flap ${className}`}>
            <span className="eh-sr">{text}</span>
            <span key={text} ref={ref} aria-hidden="true">
                {text}
            </span>
        </span>
    )
}
