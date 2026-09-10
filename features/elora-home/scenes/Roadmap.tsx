"use client"

import { useEffect, useRef, useState } from "react"
import { Shell, Heading, Eyebrow, Body, Caveat } from "../components/Primitives"
import { Icon, Check } from "../components/Icon"
import { ROADMAP } from "../data/content"
import { ROADMAP_STAGES } from "../data/roadmap"
import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/useMotion"

/**
 * Scene 5 — the personalised roadmap.
 *
 * A luminous line travels the timeline as the visitor scrolls, lighting each
 * stage as it passes. The emotional job of this section is *calm*: after the
 * document scene has shown the reader everything that can go wrong, this one
 * shows them it is a finite, ordered list of things to do.
 *
 * The line's height is bound to scroll progress rather than to a looping
 * animation, so it always reflects where the reader actually is.
 *
 * `exampleState` on each stage renders the done/active/upcoming treatment, and
 * the notice below the timeline says in plain words that this is an example —
 * a visitor must never mistake it for their own progress.
 */
export function Roadmap() {
    const trackRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const el = trackRef.current
        if (!el) return

        if (prefersReducedMotion()) {
            setProgress(1)
            return
        }

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: el,
                start: "top 72%",
                end: "bottom 62%",
                scrub: 0.4,
                onUpdate: (self) => setProgress(self.progress),
            })
        }, el)

        return () => ctx.revert()
    }, [])

    const activeCount = progress * ROADMAP_STAGES.length

    return (
        <section id="roadmap" className="eh-scene eh-roadmap" aria-labelledby="eh-roadmap-title">
            <Shell>
                <header className="eh-roadmap-head">
                    <Eyebrow>{ROADMAP.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-roadmap-title">
                        <Heading
                            lines={["Know exactly", "what comes next."]}
                            accent="what comes next."
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{ROADMAP.body}</Body>
                </header>

                <div
                    ref={trackRef}
                    className="eh-roadmap-track"
                    style={{ ["--eh-progress" as string]: progress.toFixed(3) }}
                >
                    {/* The rail and the luminous travelling line. Decorative —
                        every stage's status is also written in text below. */}
                    <div className="eh-roadmap-rail" aria-hidden="true">
                        <span className="eh-roadmap-line" />
                    </div>

                    <ol className="eh-roadmap-list">
                        {ROADMAP_STAGES.map((stage, i) => {
                            const lit = i < activeCount
                            return (
                                <li
                                    key={stage.id}
                                    className="eh-roadmap-item"
                                    data-lit={lit ? "true" : "false"}
                                    data-state={stage.exampleState}
                                >
                                    <span className="eh-roadmap-node" aria-hidden="true">
                                        {stage.exampleState === "done" ? (
                                            <Check size={13} />
                                        ) : (
                                            <Icon name={stage.icon} size={14} />
                                        )}
                                    </span>

                                    <div className="eh-roadmap-body">
                                        <div className="eh-roadmap-titlerow">
                                            <h3>{stage.label}</h3>
                                            {/* Status is spelled out — never
                                                conveyed by the node colour alone. */}
                                            <span className="eh-roadmap-status">
                                                {stage.exampleState === "done"
                                                    ? "Complete"
                                                    : stage.exampleState === "active"
                                                      ? "In progress"
                                                      : "Not started"}
                                            </span>
                                        </div>
                                        <p>{stage.detail}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </div>

                <div className="mt-8">
                    <Caveat>{ROADMAP.exampleNotice}</Caveat>
                </div>
            </Shell>
        </section>
    )
}
