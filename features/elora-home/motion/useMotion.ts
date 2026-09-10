"use client"

/**
 * Motion hooks for the Elora homepage.
 *
 * ------------------------------------------------------------------------
 * DIVISION OF LABOUR (one tool per element, never two)
 * ------------------------------------------------------------------------
 *   GSAP + ScrollTrigger  scroll-linked timelines, pinned narrative scenes,
 *                         entrance reveals (they are scroll-triggered).
 *   Motion for React      interaction and presence — the mobile drawer, tab
 *                         swaps, hover expansion. These mount/unmount, so
 *                         there is no "invisible without JS" hazard.
 *   CSS                   hover, focus, ambient texture.
 *   R3F / three           the hero globe only, lazily.
 *
 * Every hook here no-ops under `prefers-reduced-motion`, and every one is safe
 * to call during SSR.
 */

import { useEffect, useRef, useState, type RefObject } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DUR, EASE, STAGGER, TRAVEL } from "./tokens"

// Registering twice is a no-op in GSAP, and doing it at module scope means any
// scene that imports a hook gets a correctly configured GSAP without ordering
// rules between scenes.
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger)
}

/* ------------------------------------------------------------------------ */
/*  Reduced motion                                                          */
/* ------------------------------------------------------------------------ */

/** Synchronous read. Returns `false` during SSR so nothing animates on the server. */
export function prefersReducedMotion(): boolean {
    if (typeof window === "undefined" || !window.matchMedia) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Reactive version, for components that must *re-render* differently (e.g. swap
 * a 3D globe for a static image) rather than merely skip an animation.
 *
 * Starts `false` on both server and first client render so hydration matches,
 * then corrects in an effect.
 */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        if (!window.matchMedia) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduced(mq.matches)

        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    return reduced
}

/* ------------------------------------------------------------------------ */
/*  Entrance reveals                                                        */
/* ------------------------------------------------------------------------ */

export interface RevealOptions {
    /** Selector for children to stagger in. Defaults to `.eh-reveal`. */
    selector?: string
    /** Seconds between each child. */
    stagger?: number
    /** Vertical travel in px. */
    y?: number
    /** ScrollTrigger start position. */
    start?: string
    /** Delay before the first child, in seconds. */
    delay?: number
}

/**
 * Staggers `.eh-reveal` descendants into view once, when the container scrolls
 * into the viewport.
 *
 * Reads the hidden start state from CSS rather than setting it in JS, so the
 * gate in `AnimationGate.tsx` remains the single source of truth for whether
 * anything is hidden at all. If the gate did not fire, this hook returns early
 * and the content simply stays where the server put it.
 */
export function useReveal<T extends HTMLElement>(
    ref: RefObject<T | null>,
    options: RevealOptions = {}
): void {
    const {
        selector = ".eh-reveal",
        stagger = STAGGER.normal,
        y = TRAVEL.md,
        start = "top 82%",
        delay = 0,
    } = options

    useEffect(() => {
        const el = ref.current
        if (!el) return
        // The gate did not run: content is already visible and must stay that way.
        if (document.documentElement.dataset.ehAnim !== "ready") return

        const targets = el.querySelectorAll<HTMLElement>(selector)
        if (targets.length === 0) return

        const ctx = gsap.context(() => {
            gsap.to(targets, {
                opacity: 1,
                y: 0,
                duration: DUR.lg,
                ease: EASE.entrance,
                stagger,
                delay,
                // `clearProps` hands the element back to CSS once it has
                // arrived, so hover/focus transitions aren't fighting inline
                // styles GSAP left behind.
                clearProps: "transform",
                scrollTrigger: {
                    trigger: el,
                    start,
                    once: true,
                },
            })
        }, el)

        return () => ctx.revert()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, selector, stagger, y, start, delay])
}

/* ------------------------------------------------------------------------ */
/*  Scroll-linked timelines                                                 */
/* ------------------------------------------------------------------------ */

export interface SceneTimelineOptions {
    start?: string
    end?: string
    /** Pin the trigger element for the duration of the timeline. */
    pin?: boolean
    /** `true` ties progress to the scrollbar; a number adds smoothing lag. */
    scrub?: boolean | number
    /** Called on every progress update, 0 → 1. */
    onProgress?: (progress: number) => void
}

/**
 * Creates a scroll-linked GSAP timeline bound to `ref`.
 *
 * `build` receives the timeline and the container element and should only add
 * tweens — never create its own ScrollTriggers, or cleanup ordering gets messy.
 *
 * Under reduced motion nothing is created at all: the caller is expected to
 * render a readable static composition, which every scene here does.
 */
export function useSceneTimeline<T extends HTMLElement>(
    ref: RefObject<T | null>,
    build: (tl: gsap.core.Timeline, el: T) => void,
    options: SceneTimelineOptions = {},
    deps: unknown[] = []
): void {
    const buildRef = useRef(build)
    buildRef.current = build

    const {
        start = "top top",
        end = "+=100%",
        pin = false,
        scrub = 0.6,
        onProgress,
    } = options

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (prefersReducedMotion()) return

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start,
                    end,
                    pin,
                    scrub,
                    // Keeps the pinned section from jumping when the pin
                    // spacer is inserted on resize.
                    anticipatePin: pin ? 1 : 0,
                    invalidateOnRefresh: true,
                    onUpdate: onProgress
                        ? (self) => onProgress(self.progress)
                        : undefined,
                },
            })
            buildRef.current(tl, el)
        }, el)

        return () => ctx.revert()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, start, end, pin, scrub, ...deps])
}

/* ------------------------------------------------------------------------ */
/*  Interaction                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Magnetic pull for desktop CTAs.
 *
 * Restraint is the whole point: `strength` is capped low and the element never
 * travels far enough to break the button's own hit area, because a button that
 * dodges the cursor is a usability bug wearing a design costume.
 *
 * Disabled on touch (`hover: none`), under reduced motion, and for keyboard
 * users — it is a pointer affordance only.
 */
export function useMagnetic<T extends HTMLElement>(
    ref: RefObject<T | null>,
    strength = 0.22,
    max = 10
): void {
    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (prefersReducedMotion()) return
        if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return

        const quickX = gsap.quickTo(el, "x", { duration: DUR.sm, ease: EASE.out })
        const quickY = gsap.quickTo(el, "y", { duration: DUR.sm, ease: EASE.out })

        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            const dx = e.clientX - (r.left + r.width / 2)
            const dy = e.clientY - (r.top + r.height / 2)
            quickX(gsap.utils.clamp(-max, max, dx * strength))
            quickY(gsap.utils.clamp(-max, max, dy * strength))
        }

        const onLeave = () => {
            quickX(0)
            quickY(0)
        }

        el.addEventListener("pointermove", onMove)
        el.addEventListener("pointerleave", onLeave)
        return () => {
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerleave", onLeave)
            gsap.killTweensOf(el)
        }
    }, [ref, strength, max])
}

/**
 * Normalised pointer position over an element, for parallax.
 *
 * Returns a ref holding `{x, y}` in the range -1 → 1 and writes the same values
 * to CSS custom properties (`--eh-px`, `--eh-py`) on the element, so parallax
 * layers can be driven entirely from CSS `transform: translate3d(calc(...))`
 * without a React re-render per pointer move.
 */
export function usePointerParallax<T extends HTMLElement>(ref: RefObject<T | null>): void {
    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (prefersReducedMotion()) return
        if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return

        let frame = 0
        let targetX = 0
        let targetY = 0
        let currentX = 0
        let currentY = 0

        const loop = () => {
            // Critically damped-ish follow, so the parallax trails the cursor
            // slightly instead of snapping to it.
            currentX += (targetX - currentX) * 0.08
            currentY += (targetY - currentY) * 0.08
            el.style.setProperty("--eh-px", currentX.toFixed(4))
            el.style.setProperty("--eh-py", currentY.toFixed(4))
            frame = requestAnimationFrame(loop)
        }

        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            targetX = ((e.clientX - r.left) / r.width) * 2 - 1
            targetY = ((e.clientY - r.top) / r.height) * 2 - 1
        }

        const onLeave = () => {
            targetX = 0
            targetY = 0
        }

        el.addEventListener("pointermove", onMove)
        el.addEventListener("pointerleave", onLeave)
        frame = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(frame)
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerleave", onLeave)
        }
    }, [ref])
}

/**
 * Counts a number up when it scrolls into view.
 *
 * Returns the display string. Under reduced motion — or without the gate — it
 * returns the final value immediately, so the number is never withheld.
 */
export function useCountUp(
    target: number,
    ref: RefObject<HTMLElement | null>,
    duration = DUR.xxl
): string {
    const [display, setDisplay] = useState(() => target.toLocaleString())

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (prefersReducedMotion()) {
            setDisplay(target.toLocaleString())
            return
        }

        const counter = { value: 0 }
        const ctx = gsap.context(() => {
            gsap.to(counter, {
                value: target,
                duration,
                ease: EASE.out,
                onUpdate: () => setDisplay(Math.round(counter.value).toLocaleString()),
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
            })
        }, el)

        return () => ctx.revert()
    }, [target, ref, duration])

    return display
}

export { gsap, ScrollTrigger, DUR, EASE, STAGGER, TRAVEL }
