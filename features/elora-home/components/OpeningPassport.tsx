"use client"

import { useEffect, useRef } from "react"
import { Passport } from "./Passport"
import { HERO } from "../data/content"
import { prefersReducedMotion } from "../motion/useMotion"

/**
 * The hero passport, which opens.
 *
 * As the visitor starts scrolling (or hovers it on desktop), the cover swings
 * open on its spine in 3D and shows the data page: a sample preparation
 * profile — the hero's own readiness figure and document checks, stamped
 * "Sample · In preparation". It previews what Elora produces, using only
 * what the hero already shows, so it promises nothing new.
 *
 * ------------------------------------------------------------------------
 * ONE OWNER PER ELEMENT
 * ------------------------------------------------------------------------
 * The hero's entrance timeline animates `.eh-hero-passport` (the wrapper this
 * sits in) and the pointer parallax moves its layer. The opening rotates only
 * `.eh-book-cover`, inside, so no element is animated from two places.
 *
 * Progress is written to a CSS custom property, never React state, so
 * scrolling doesn't re-render. Hover is pure CSS. Under reduced motion, or
 * with the animation gate closed, the passport simply stays closed — exactly
 * the composition it was before.
 */

/** Fraction of the hero's height scrolled at which the cover is fully open. */
const OPEN_BY = 0.38

export function OpeningPassport({ width = 300 }: { width?: number }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const book = ref.current
        if (!book) return
        if (prefersReducedMotion()) return
        if (document.documentElement.dataset.ehAnim !== "ready") return
        book.dataset.live = "true"

        const hero = book.closest(".eh-hero") as HTMLElement | null
        let raf = 0
        const update = () => {
            raf = 0
            const span = (hero?.offsetHeight ?? window.innerHeight) * OPEN_BY
            const p = Math.min(1, Math.max(0, window.scrollY / span))
            book.style.setProperty("--eh-scroll-open", p.toFixed(3))
        }
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }
        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", onScroll)
            cancelAnimationFrame(raf)
        }
    }, [])

    return (
        <div ref={ref} className="eh-book" aria-hidden="true">
            {/* ------------------------------------------------ data page */}
            <div className="eh-book-page">
                <div className="eh-book-page-inner">
                    <p className="eh-book-kicker">Elora · Preparation profile</p>

                    <div className="eh-book-id">
                        <span className="eh-book-photo">
                            {/* A generic silhouette — never a real face. */}
                            <svg viewBox="0 0 40 48" fill="currentColor">
                                <circle cx="20" cy="17" r="8.5" />
                                <path d="M4 48c0-10 7-16 16-16s16 6 16 16z" />
                            </svg>
                        </span>
                        <dl className="eh-book-fields">
                            <div>
                                <dt>Profile</dt>
                                <dd>Sample applicant</dd>
                            </div>
                            <div>
                                <dt>Readiness</dt>
                                <dd>{HERO.readiness.value}%</dd>
                            </div>
                        </dl>
                    </div>

                    <ul className="eh-book-checks">
                        {HERO.signals.map((s) => (
                            <li key={s.id} data-state={s.state}>
                                <span className="eh-book-mark" />
                                <span>{s.label}</span>
                            </li>
                        ))}
                    </ul>

                    <span className="eh-book-stamp">
                        <span>Sample</span>
                        <span>In preparation</span>
                    </span>

                    <p className="eh-book-mrz">
                        P&lt;ELORA&lt;SAMPLE&lt;&lt;APPLICANT&lt;&lt;&lt;&lt;&lt;&lt;
                        <br />
                        {HERO.readiness.value}&lt;READINESS&lt;&lt;PREPARATION&lt;&lt;&lt;&lt;
                    </p>
                </div>
            </div>

            {/* ------------------------------------------------ the cover */}
            <div className="eh-book-cover">
                <div className="eh-book-front">
                    <Passport width={width} uid="hero" />
                </div>
                {/* Inside of the cover: endpaper, seen once it swings past 90°. */}
                <div className="eh-book-back" />
            </div>
        </div>
    )
}
