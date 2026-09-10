"use client"

import { useEffect, useRef } from "react"
import { Shell, Heading, Eyebrow, Body } from "../components/Primitives"
import { Cta } from "../components/Cta"
import { ArrowRight } from "../components/Icon"
import { Passport } from "../components/Passport"
import Image from "next/image"
import { FINAL } from "../data/content"
import { FINAL_IMAGES } from "../data/media"
import { gsap, ScrollTrigger, prefersReducedMotion, DUR, EASE } from "../motion/useMotion"

/**
 * The final scene — arrival at the departure point.
 *
 * This closes the loop the hero opened. The same objects that were scattered
 * across the page — documents, the passport, the readiness figure — gather into
 * one squared-up portfolio. The hero's composition was loose and floating; this
 * one is stacked, aligned and finished, and that contrast is the whole argument
 * of the page made visually in one frame.
 *
 * The gather is scroll-linked, so the visitor completes it themselves.
 */
export function FinalCta() {
    const rootRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        if (prefersReducedMotion()) return
        if (document.documentElement.dataset.ehAnim !== "ready") return

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: EASE.entrance },
                scrollTrigger: { trigger: root, start: "top 68%", once: true },
            })

            // The scattered elements converge into the portfolio.
            tl.fromTo(
                ".eh-final-doc, .eh-final-photo",
                {
                    opacity: 0,
                    // Each starts off at its own angle and offset, as though
                    // arriving from elsewhere on the page.
                    x: (i: number) => [-90, 70, -50, 110][i] ?? 0,
                    y: (i: number) => [-60, -30, 70, 40][i] ?? 0,
                    rotate: (i: number) => [-16, 12, 9, -7][i] ?? 0,
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: (i: number) => [-4, -1.5, 1.5, 4][i] ?? 0,
                    duration: DUR.xl,
                    stagger: 0.09,
                },
                0
            )

            tl.fromTo(
                ".eh-final-passport",
                { opacity: 0, y: 40, scale: 0.94 },
                { opacity: 1, y: 0, scale: 1, duration: DUR.xl },
                0.25
            )
        }, root)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={rootRef} className="eh-scene eh-final" aria-labelledby="eh-final-title">
            <span className="eh-aurora" aria-hidden="true" />

            <Shell>
                <div className="eh-final-grid">
                    <div className="eh-final-copy">
                        <Eyebrow>{FINAL.eyebrow}</Eyebrow>
                        <div className="mt-4" id="eh-final-title">
                            <Heading
                                lines={["Your application deserves", "more than guesswork."]}
                                accent="more than guesswork."
                                size="lg"
                            />
                        </div>
                        <Body className="mt-6">{FINAL.body}</Body>

                        <div className="eh-final-ctas">
                            <Cta
                                href={FINAL.primaryCta.href}
                                variant="primary"
                                event="final_cta"
                                eventLabel="start_preparing_free"
                                scene="final"
                                magnetic
                                sheen
                                trailing={<ArrowRight />}
                            >
                                {FINAL.primaryCta.label}
                            </Cta>
                            <Cta
                                href={FINAL.secondaryCta.href}
                                variant="secondary"
                                event="final_cta"
                                eventLabel="view_ai_tools"
                                scene="final"
                            >
                                {FINAL.secondaryCta.label}
                            </Cta>
                        </div>
                    </div>

                    {/* The assembled portfolio.
                        `aria-hidden` sits on the abstract shapes, NOT on the
                        stage — otherwise the photographs' alt text would be
                        written and then never announced. */}
                    <div className="eh-final-stage">
                        <div className="eh-final-portfolio">
                            {["Documents", "Statement", "Interview", "Readiness"].map((label, i) => (
                                <div
                                    className="eh-final-doc eh-paper"
                                    key={label}
                                    data-i={i}
                                    aria-hidden="true"
                                >
                                    <span>{label}</span>
                                </div>
                            ))}
                            <div className="eh-final-passport" aria-hidden="true">
                                <Passport width={190} uid="final" />
                            </div>

                            {/* The two photographs close the arc the hero
                                opened: preparation at the top of the page,
                                arrival and the life that follows at the end. */}
                            {FINAL_IMAGES.map((img, i) => (
                                <figure
                                    className="eh-final-photo"
                                    data-i={i}
                                    key={img.src}
                                >
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        width={img.width}
                                        height={img.height}
                                        sizes="(max-width: 900px) 40vw, 18vw"
                                        loading="lazy"
                                    />
                                    <figcaption>{img.caption}</figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </div>
            </Shell>
        </section>
    )
}
