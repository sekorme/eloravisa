"use client"

import { useEffect, useRef } from "react"
import { Passport } from "../components/Passport"
import { HeroMedia } from "../components/HeroMedia"
import { ReadinessRing } from "../components/ReadinessRing"
import { Cta } from "../components/Cta"
import { Heading, Board } from "../components/Primitives"
import { ArrowRight, ArrowDown, Check, Icon } from "../components/Icon"
import { HERO } from "../data/content"
import { gsap, prefersReducedMotion, usePointerParallax, DUR, EASE } from "../motion/useMotion"

/**
 * Scene 1 — the cinematic conversion hero.
 *
 * ------------------------------------------------------------------------
 * THE ENTRANCE IS CHOREOGRAPHED, NOT SIMULTANEOUS
 * ------------------------------------------------------------------------
 * Nine beats, sequenced so the eye is led rather than assaulted: light, then
 * route, then the passport arriving with weight, then documents separating,
 * then the headline rising line by line, then the supporting copy, then the
 * CTAs, then the readiness figure resolving, then each verification signal
 * ticking over one at a time.
 *
 * The whole sequence is ~2.6s and never blocks reading: every element is in
 * the server HTML at its final position, and the animation only runs if the
 * gate in `AnimationGate.tsx` decided it was safe. Under reduced motion, or
 * without JS, this is simply a well-composed static hero.
 */
export function Hero() {
    const rootRef = useRef<HTMLElement>(null)
    const stageRef = useRef<HTMLDivElement>(null)

    // Depth response to the cursor. Writes CSS custom properties rather than
    // React state, so moving the mouse never triggers a render.
    usePointerParallax(stageRef)

    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        // Gate closed (no JS path, or reduced motion): everything already sits
        // at its final state in the DOM. Nothing to do.
        if (document.documentElement.dataset.ehAnim !== "ready") return
        if (prefersReducedMotion()) return

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: EASE.entrance },
                // A beat of breathing room so the first frame is the composed
                // page, not a half-built one.
                delay: 0.15,
            })

            // 1 — ambient light expands.
            tl.fromTo(
                ".eh-hero-glow",
                { opacity: 0, scale: 0.82 },
                { opacity: 1, scale: 1, duration: DUR.xl, ease: EASE.out },
                0
            )

            // 2 — the photograph settles in. A slow, small scale-down reads
            //     as a camera coming to rest rather than as a zoom effect.
            //
            //     TRANSFORM ONLY, no opacity: this image is the page's LCP
            //     element, and an element faded up from zero doesn't count as
            //     painted until the fade runs. Scaling leaves it contentful
            //     from the very first frame.
            tl.fromTo(
                ".eh-hero-media",
                { scale: 1.06 },
                { scale: 1, duration: 1.6, ease: EASE.out },
                0
            )

            // 3 — the passport enters with perspective and weight.
            tl.fromTo(
                ".eh-hero-passport",
                { opacity: 0, yPercent: 26, rotateY: -22, rotateZ: -10, scale: 0.94 },
                {
                    opacity: 1,
                    yPercent: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1,
                    duration: DUR.xl,
                },
                0.5
            )

            // 4 — document layers separate.
            tl.fromTo(
                ".eh-hero-doc",
                { opacity: 0, y: 26, x: -14, rotateZ: 0 },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    rotateZ: (i: number) => [-7, -2.5, 3.5][i] ?? 0,
                    duration: DUR.lg,
                    stagger: 0.09,
                },
                0.85
            )

            // 5 — headline reveals by line, out of its mask.
            //     `fromTo`, not `to`: the CSS start state is a percentage
            //     translate, and GSAP can only read the computed matrix back as
            //     pixels — so `to({ yPercent: 0 })` tweens 0 → 0 and the line
            //     never leaves the mask. See RevealOrchestrator for the full note.
            //     `y: 0` on both ends clears the pixel offset GSAP decomposed
            //     from the CSS matrix, which would otherwise compose with the
            //     percentage and leave each line short.
            tl.fromTo(
                ".eh-hero-line",
                { yPercent: 110, y: 0 },
                { yPercent: 0, y: 0, duration: 0.95, stagger: 0.1, ease: EASE.entrance },
                0.35
            )

            // 6 — supporting copy fades and sharpens.
            tl.fromTo(
                ".eh-hero-support",
                { opacity: 0, y: 14, filter: "blur(6px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: DUR.lg },
                0.95
            )

            // 7 — CTAs, lightly staggered.
            tl.fromTo(
                ".eh-hero-cta",
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: DUR.md, stagger: 0.09 },
                1.2
            )

            // 8 — the readiness panel arrives. (The figure itself counts up via
            //     ReadinessRing's own ScrollTrigger, which is already in view.)
            tl.fromTo(
                ".eh-hero-readiness",
                { opacity: 0, scale: 0.92 },
                { opacity: 1, scale: 1, duration: DUR.lg },
                1.15
            )

            // 9 — verification signals activate individually, not as a block.
            tl.fromTo(
                ".eh-hero-signal",
                { opacity: 0, x: 12 },
                { opacity: 1, x: 0, duration: DUR.md, stagger: 0.13 },
                1.45
            )

            // The scroll cue is the last thing to appear — it is an invitation
            // to leave, so it must not compete with the CTAs.
            tl.fromTo(
                ".eh-hero-cue",
                { opacity: 0 },
                { opacity: 1, duration: DUR.lg },
                2.1
            )
        }, root)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={rootRef} className="eh-hero" aria-labelledby="eh-hero-title">
            {/* The photographic backdrop. Always an image; the video layers
                over it only where that is a good idea. See HeroMedia. */}
            <HeroMedia />

            {/* Atmospheric light. Static gradient, scaled once on entrance and
                then left alone — never continuously animated. */}
            <div className="eh-hero-glow" aria-hidden="true" />

            <div className="eh-shell eh-hero-inner">
                {/* ---------------------------------------------------- copy */}
                <div className="eh-hero-copy">
                    <p className="eh-eyebrow eh-hero-support">{HERO.eyebrow}</p>

                    <h1
                        id="eh-hero-title"
                        className="eh-display eh-hero-title"
                        style={{ fontSize: "var(--eh-text-5xl)" }}
                    >
                        {HERO.headlineLines.map((line, i) => (
                            <span className="eh-line-mask" key={i}>
                                <span className="eh-line-inner eh-hero-line">
                                    {line.includes(HERO.headlineAccent) ? (
                                        <>
                                            {line.slice(0, line.indexOf(HERO.headlineAccent))}
                                            <span className="eh-grad">{HERO.headlineAccent}</span>
                                        </>
                                    ) : (
                                        line
                                    )}
                                </span>
                            </span>
                        ))}
                    </h1>

                    <p className="eh-body eh-hero-support eh-hero-lede">{HERO.supporting}</p>

                    <div className="eh-hero-ctas">
                        <Cta
                            href={HERO.primaryCta.href}
                            variant="primary"
                            event="hero_primary_cta"
                            eventLabel="check_readiness"
                            scene="hero"
                            magnetic
                            sheen
                            className="eh-hero-cta"
                            trailing={<ArrowRight />}
                        >
                            {HERO.primaryCta.label}
                        </Cta>
                        <Cta
                            href={HERO.secondaryCta.href}
                            variant="secondary"
                            event="hero_secondary_cta"
                            eventLabel="explore_how_it_works"
                            scene="hero"
                            className="eh-hero-cta"
                        >
                            {HERO.secondaryCta.label}
                        </Cta>
                    </div>

                    <p className="eh-hero-reassurance eh-hero-cta">{HERO.reassurance}</p>
                </div>

                {/* ------------------------------------------------ composition */}
                <div className="eh-hero-stage" ref={stageRef}>
                    {/* Layer 2 — document stack. */}
                    <div className="eh-hero-layer eh-hero-layer--mid">
                        <div className="eh-hero-docs" aria-hidden="true">
                            {["Bank statement", "Admission letter", "Itinerary"].map((label, i) => (
                                <div className="eh-hero-doc eh-paper" key={label} data-doc={i}>
                                    <span className="eh-hero-doc-title">{label}</span>
                                    <span className="eh-hero-doc-rules">
                                        {Array.from({ length: 4 }).map((_, r) => (
                                            <i key={r} style={{ width: `${88 - r * 13}%` }} />
                                        ))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Layer 3 — the passport, closest, largest parallax. */}
                    <div className="eh-hero-layer eh-hero-layer--near">
                        <div className="eh-hero-passport">
                            <Passport width={300} uid="hero" />
                        </div>
                    </div>

                    {/* Layer 4 — floating product signals. */}
                    <div className="eh-hero-readiness">
                        <ReadinessRing
                            value={HERO.readiness.value}
                            label={HERO.readiness.label}
                            size={116}
                            pulse
                        />
                    </div>

                    <ul className="eh-hero-signals" aria-label="Example document checks">
                        {HERO.signals.map((s) => (
                            <li key={s.id} className="eh-hero-signal" data-state={s.state}>
                                <span className="eh-hero-signal-icon" aria-hidden="true">
                                    {s.state === "verified" ? (
                                        <Check size={13} />
                                    ) : s.state === "attention" ? (
                                        <Icon name="scan" size={13} />
                                    ) : (
                                        <span className="eh-hero-signal-dot" />
                                    )}
                                </span>
                                <span className="eh-hero-signal-label">{s.label}</span>
                                {/* State is carried in text, not colour alone. */}
                                <span className="eh-hero-signal-state">
                                    {s.state === "verified"
                                        ? "Verified"
                                        : s.state === "attention"
                                          ? "Needs work"
                                          : "Pending"}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <Board className="eh-hero-sample">{HERO.sampleLabel}</Board>
                </div>
            </div>

            <a className="eh-hero-cue" href="#journey">
                <span>{HERO.scrollCue}</span>
                <ArrowDown size={16} />
            </a>
        </section>
    )
}
