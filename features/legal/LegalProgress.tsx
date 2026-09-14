"use client"

import { useEffect, useRef } from "react"

/**
 * A thin reading-progress bar pinned to the top of the viewport.
 *
 * Progress runs from the article's top reaching a line 30% down the screen to
 * its bottom passing that line. The bar is written to directly (a `scaleX`
 * transform per animation frame) so scrolling never re-renders React.
 *
 * Decorative, so hidden from assistive tech: the contents rail already says
 * where the reader is.
 */
export function LegalProgress() {
    const bar = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = bar.current
        const article = document.querySelector<HTMLElement>(".eh-legal-article")
        if (!el || !article) return

        let frame = 0
        const update = () => {
            frame = 0
            const rect = article.getBoundingClientRect()
            const line = window.innerHeight * 0.3
            const progress = Math.min(1, Math.max(0, (line - rect.top) / Math.max(1, rect.height)))
            el.style.transform = `scaleX(${progress})`
        }
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }

        update()
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)
        return () => {
            window.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [])

    return <div ref={bar} className="eh-legal-progress" aria-hidden="true" />
}
