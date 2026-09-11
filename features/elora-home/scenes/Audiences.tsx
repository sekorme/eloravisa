"use client"

import Image from "next/image"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Shell, Heading, Eyebrow, Body } from "../components/Primitives"
import { AUDIENCES } from "../data/audiences"
import { AUDIENCE } from "../data/content"
import { useReducedMotion } from "../motion/useMotion"

/**
 * "Who is this for" — the four applicant situations.
 *
 * ------------------------------------------------------------------------
 * TWO LAYOUTS, ONE SET OF NODES
 * ------------------------------------------------------------------------
 * Desktop (≥900px): a row of four photographic panels. The selected one expands
 * to take most of the row and reveals its copy; the others narrow to a spine
 * with the title set vertically. Selection follows hover *and* focus, and every
 * panel is a real `<button>` with `aria-expanded`, so a keyboard user gets what
 * a mouse user gets, in the same order.
 *
 * Mobile (<900px): a swipeable carousel. Each panel becomes a full card at 82%
 * of the viewport, and the rail scroll-snaps between them.
 *
 * ------------------------------------------------------------------------
 * WHY THE GESTURE IS SAFE
 * ------------------------------------------------------------------------
 * The swipe is native `overflow-x: auto` + `scroll-snap-type`, not a JS drag
 * handler. That matters: the browser keeps momentum scrolling, respects the
 * platform's rubber-banding, and — critically — resolves the scroll-direction
 * conflict itself, so a mostly-vertical swipe still scrolls the page. A custom
 * pointer-drag would have to guess at that, and guessing wrong is how carousels
 * end up trapping the page.
 *
 * `overscroll-behavior-x: contain` stops a swipe past the last card from
 * triggering browser back-navigation.
 *
 * ------------------------------------------------------------------------
 * SWIPE IS NEVER THE ONLY WAY
 * ------------------------------------------------------------------------
 * The dots below the rail are real buttons that scroll a card into view. Swipe
 * is a shortcut for people who can and want to; anyone using a keyboard, a
 * switch, or voice control has an equivalent control that is a normal tap
 * target. Tabbing through the panels also brings them into view natively.
 */
export function Audiences() {
    const [activeId, setActiveId] = useState(AUDIENCES[0].id)
    const [isCarousel, setIsCarousel] = useState(false)
    const railRef = useRef<HTMLDivElement>(null)
    const groupId = useId()
    const reduced = useReducedMotion()

    /* Which layout is live. Kept in state rather than read inside handlers so
       the dots render only when they actually control something. */
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 899px)")
        const sync = () => setIsCarousel(mq.matches)
        sync()
        mq.addEventListener("change", sync)
        return () => mq.removeEventListener("change", sync)
    }, [])

    /* Track which card is centred, so the dots reflect where the visitor is.
       Driven by the rail's own scroll position — the carousel has no JS
       animation of its own, so this is purely observational. */
    useEffect(() => {
        const rail = railRef.current
        if (!rail || !isCarousel) return

        let ticking = false
        const onScroll = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(() => {
                const mid = rail.scrollLeft + rail.clientWidth / 2
                let bestId = AUDIENCES[0].id
                let bestDist = Infinity

                Array.from(rail.children).forEach((child, i) => {
                    const el = child as HTMLElement
                    const centre = el.offsetLeft + el.offsetWidth / 2
                    const dist = Math.abs(centre - mid)
                    if (dist < bestDist) {
                        bestDist = dist
                        bestId = AUDIENCES[i]?.id ?? bestId
                    }
                })

                setActiveId((prev) => (prev === bestId ? prev : bestId))
                ticking = false
            })
        }

        onScroll()
        rail.addEventListener("scroll", onScroll, { passive: true })
        return () => rail.removeEventListener("scroll", onScroll)
    }, [isCarousel])

    const scrollTo = useCallback(
        (index: number) => {
            const rail = railRef.current
            if (!rail) return
            const el = rail.children[index] as HTMLElement | undefined
            if (!el) return
            rail.scrollTo({
                left: el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2,
                behavior: reduced ? "auto" : "smooth",
            })
        },
        [reduced]
    )

    return (
        <section
            id="who-is-this-for"
            className="eh-scene eh-aud"
            aria-labelledby="eh-aud-title"
        >
            <Shell>
                <header className="eh-aud-head">
                    <Eyebrow>{AUDIENCE.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-aud-title">
                        <Heading lines={["Who is this for?"]} accent="for?" size="lg" />
                    </div>
                    <Body className="mt-6">{AUDIENCE.body}</Body>
                </header>

                <div
                    ref={railRef}
                    className="eh-aud-rail"
                    role="group"
                    aria-label="Applicant situations"
                >
                    {AUDIENCES.map((a, i) => {
                        const isActive = a.id === activeId
                        const panelId = `${groupId}-${a.id}`

                        return (
                            <button
                                key={a.id}
                                type="button"
                                className="eh-aud-panel eh-reveal"
                                data-active={isActive ? "true" : "false"}
                                // In carousel mode every card is fully open, so
                                // claiming a collapsed state would be a lie.
                                aria-expanded={isCarousel ? undefined : isActive}
                                aria-controls={isCarousel ? undefined : panelId}
                                onClick={() => {
                                    setActiveId(a.id)
                                    // Tapping a half-visible neighbour centres
                                    // it — a real action rather than a no-op.
                                    if (isCarousel) scrollTo(i)
                                }}
                                onMouseEnter={() => {
                                    if (!isCarousel) setActiveId(a.id)
                                }}
                                onFocus={() => setActiveId(a.id)}
                            >
                                <Image
                                    src={a.image.src}
                                    alt={a.image.alt}
                                    width={a.image.width}
                                    height={a.image.height}
                                    sizes="(max-width: 900px) 86vw, 45vw"
                                    loading="lazy"
                                    className="eh-aud-photo"
                                />

                                {/* The wash that keeps the copy legible over a
                                    photograph. Deepens as the panel opens. */}
                                <span className="eh-aud-scrim" aria-hidden="true" />

                                {/* The collapsed desktop state: index plus a
                                    vertical title, so a narrow panel still says
                                    what it is rather than being a sliver. */}
                                <span className="eh-aud-spine" aria-hidden="true">
                                    <span className="eh-aud-index">{a.index}</span>
                                    <span className="eh-aud-spine-title">{a.title}</span>
                                </span>

                                <span className="eh-aud-content" id={panelId}>
                                    <span className="eh-aud-index-open" aria-hidden="true">
                                        {a.index}
                                    </span>
                                    <span className="eh-aud-title">{a.title}</span>
                                    <span className="eh-aud-tagline">{a.tagline}</span>
                                    <span className="eh-aud-body">{a.body}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Carousel controls. Rendered only when the carousel is the
                    live layout, so there are never dots for a row that isn't
                    scrolling. Swipe is the shortcut; these are the guarantee. */}
                {isCarousel ? (
                    <div className="eh-aud-dots" role="group" aria-label="Choose a situation">
                        {AUDIENCES.map((a, i) => (
                            <button
                                key={a.id}
                                type="button"
                                className="eh-aud-dot"
                                data-active={a.id === activeId ? "true" : "false"}
                                aria-current={a.id === activeId ? "true" : undefined}
                                onClick={() => {
                                    setActiveId(a.id)
                                    scrollTo(i)
                                }}
                            >
                                <span className="eh-sr">{a.title}</span>
                                <span className="eh-aud-dot-mark" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                ) : null}
            </Shell>
        </section>
    )
}
