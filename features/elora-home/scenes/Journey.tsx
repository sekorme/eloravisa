"use client"

import { useEffect, useRef, useState } from "react"
import { Shell, Heading, Eyebrow, Body } from "../components/Primitives"
import { Icon } from "../components/Icon"
import { JOURNEY } from "../data/content"
import { JOURNEY_STAGES } from "../data/journey"
import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/useMotion"

/**
 * Scene 2 — the pinned transformation.
 *
 * ------------------------------------------------------------------------
 * WHY STICKY, NOT GSAP PIN
 * ------------------------------------------------------------------------
 * ScrollTrigger's `pin` works by injecting a spacer element and taking the
 * pinned node out of flow. That is powerful, but it fights Lenis, it can shift
 * layout on resize as the spacer is remeasured, and — worst — it makes the
 * scrollbar lie about how long the page is.
 *
 * `position: sticky` gets the identical visual result using the browser's own
 * compositor: no spacer, no measurement, no layout shift, correct scrollbar,
 * and it degrades to normal flow anywhere it isn't supported. ScrollTrigger is
 * still used, but only to *report progress* — it never touches layout.
 *
 * The visitor is never trapped: normal scrolling always moves the page. This is
 * a scene that reacts to scroll, not one that hijacks it.
 *
 * The workspace *morphs* — the same five card elements move, rotate and
 * recolour between stages. Their DOM identity never changes, which is what
 * makes the transitions read as one continuous object rather than four
 * screens swapping.
 */

const STAGE_COUNT = JOURNEY_STAGES.length

export function Journey() {
    const rootRef = useRef<HTMLElement>(null)
    /** The tall scroll track the sticky viewport travels through. Progress is
     *  measured against this, not the whole section, so the header and the
     *  reduced-motion fallback list can't skew the stage mapping. */
    const trackRef = useRef<HTMLDivElement>(null)
    const [stage, setStage] = useState(0)

    useEffect(() => {
        const root = rootRef.current
        const track = trackRef.current
        if (!root || !track) return

        if (prefersReducedMotion()) {
            // Reduced motion still gets the narrative, just not scroll-driven:
            // every stage is rendered in full below (see `data-static`), so
            // there is nothing to advance.
            return
        }

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: track,
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    // Map scroll progress onto a stage index. The clamp matters:
                    // at progress exactly 1 the raw index would be STAGE_COUNT,
                    // which is off the end of the array.
                    const next = Math.min(
                        STAGE_COUNT - 1,
                        Math.floor(self.progress * STAGE_COUNT)
                    )
                    setStage((prev) => (prev === next ? prev : next))
                },
            })
        }, root)

        return () => ctx.revert()
    }, [])

    const active = JOURNEY_STAGES[stage]

    return (
        <section
            ref={rootRef}
            id="journey"
            className="eh-journey"
            aria-labelledby="eh-journey-title"
        >
            <Shell>
                <header className="eh-journey-head">
                    <Eyebrow>{JOURNEY.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-journey-title">
                        <Heading lines={[JOURNEY.headline]} size="lg" />
                    </div>
                    <Body className="mt-6">{JOURNEY.intro}</Body>
                </header>
            </Shell>

            {/* The scroll track gives the sticky viewport somewhere to travel.
                Its height is what sets how much scrolling one stage costs. */}
            <div ref={trackRef} className="eh-journey-track">
                <div className="eh-journey-sticky">
                <Shell>
                    <div className="eh-journey-grid" data-stage={stage}>
                        {/* ------------------------------------------- rail */}
                        <ol className="eh-journey-rail" aria-label="Stages">
                            {JOURNEY_STAGES.map((s, i) => (
                                <li
                                    key={s.id}
                                    data-active={i === stage ? "true" : "false"}
                                    data-done={i < stage ? "true" : "false"}
                                >
                                    <span className="eh-journey-rail-dot" aria-hidden="true" />
                                    <span className="eh-journey-rail-index">{s.index}</span>
                                    <span className="eh-journey-rail-label">{s.railLabel}</span>
                                </li>
                            ))}
                        </ol>

                        {/* --------------------------------------- narrative */}
                        {/* aria-live so a screen-reader user is told the copy
                            changed — otherwise the scroll silently swaps text
                            under them. `polite` never interrupts. */}
                        <div className="eh-journey-copy" aria-live="polite" aria-atomic="true">
                            <p className="eh-journey-index" aria-hidden="true">
                                {active.index} / {String(STAGE_COUNT).padStart(2, "0")}
                            </p>
                            <h3 className="eh-display eh-journey-title">{active.title}</h3>
                            <p className="eh-journey-body">{active.body}</p>
                        </div>

                        {/* --------------------------------------- workspace */}
                        <div className="eh-workspace" aria-hidden="true">
                            {/* `eh-dark` flips the surface tokens: this frame is a dark app window
                                sitting on a white page, so its cards, borders and text
                                have to invert with it. */}
                            <div className="eh-workspace-frame eh-dark">
                                <span className="eh-workspace-chrome">
                                    <i /> <i /> <i />
                                    <em>Elora workspace</em>
                                </span>

                                {/* Stage 1 only: the four inputs entering. */}
                                <div className="eh-workspace-inputs">
                                    {["Destination", "Visa type", "Purpose", "Timeline"].map((f) => (
                                        <span key={f}>{f}</span>
                                    ))}
                                </div>

                                {/* The five persistent objects. Same nodes in
                                    every stage — only their transform, border
                                    and badge change. */}
                                <div className="eh-workspace-cards">
                                    {[
                                        { id: 0, label: "Passport", flag: null },
                                        { id: 1, label: "Bank statement", flag: "conflict" },
                                        { id: 2, label: "Employment letter", flag: null },
                                        { id: 3, label: "Admission letter", flag: null },
                                        { id: 4, label: "Statement of purpose", flag: "weak" },
                                    ].map((c) => (
                                        <div
                                            key={c.id}
                                            className="eh-wcard"
                                            data-card={c.id}
                                            data-flag={c.flag ?? "none"}
                                        >
                                            <span className="eh-wcard-tick">
                                                <Icon name="checklist" size={11} />
                                            </span>
                                            <span className="eh-wcard-label">{c.label}</span>
                                            <span className="eh-wcard-badge">
                                                {c.flag === "conflict"
                                                    ? "Dates"
                                                    : c.flag === "weak"
                                                      ? "Weak"
                                                      : "OK"}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Stage 3 only: the scanning beam. */}
                                <div className="eh-workspace-scan" />

                                {/* Stage 4 only: readiness + interview. */}
                                <div className="eh-workspace-result">
                                    <span className="eh-workspace-score">
                                        <b>82</b>
                                        <i>%</i>
                                    </span>
                                    <span className="eh-workspace-result-label">
                                        Readiness · example
                                    </span>
                                    <span className="eh-workspace-chip">
                                        <Icon name="interview" size={12} />
                                        Interview practice ready
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Shell>
                </div>
            </div>

            {/* ----------------------------------------------------------------
                Reduced-motion / no-JS fallback.

                The sticky scene above shows one stage at a time and depends on
                scroll progress to advance. With motion suppressed it would show
                stage 1 forever, so the full narrative is also rendered as a
                plain ordered list. Exactly one of the two is ever displayed —
                see `.eh-journey-static` in the stylesheet.
               ---------------------------------------------------------------- */}
            <Shell>
                <ol className="eh-journey-static">
                    {JOURNEY_STAGES.map((s) => (
                        <li key={s.id}>
                            <span className="eh-board">{s.index}</span>
                            <h3 className="eh-display">{s.title}</h3>
                            <p>{s.body}</p>
                        </li>
                    ))}
                </ol>
            </Shell>
        </section>
    )
}
