"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { gsap, ScrollTrigger, prefersReducedMotion, DUR, EASE, STAGGER } from "./useMotion"

/**
 * The single reveal orchestrator for the whole page.
 *
 * ------------------------------------------------------------------------
 * WHY THIS REPLACED PER-SCENE REVEAL WRAPPERS
 * ------------------------------------------------------------------------
 * The first version required every scene to wrap its content in a `<Reveal>`
 * component that animated `.eh-reveal` descendants. That made the *hidden*
 * state global (applied by CSS behind the animation gate) but the *reveal*
 * local — so any heading, eyebrow or paragraph that wasn't inside a wrapper
 * was hidden by CSS and never animated back.
 *
 * Eight of fourteen scenes had no wrapper. Their section titles and body copy
 * were invisible on the live page. That is exactly the class of bug you get
 * when "hide" and "show" live in different places and one of them is opt-in.
 *
 * So the reveal is now global and automatic: this component finds every
 * revealable element on the page and wires it up, once per route. A scene cannot forget
 * to opt in, because there is nothing to opt into. Adding a new section can no
 * longer make its own title disappear.
 *
 * `ScrollTrigger.batch` groups elements that enter the viewport together, so a
 * row of four cards still staggers as a row rather than each animating alone —
 * the grouped feel is kept without the grouping being a manual step.
 *
 * ------------------------------------------------------------------------
 * RE-WIRED ON EVERY ROUTE CHANGE
 * ------------------------------------------------------------------------
 * Both effects are keyed on the pathname, not run once. When pages share a
 * layout that renders `SiteChrome` (the four legal pages do), a client-side
 * navigation swaps the page but keeps this component mounted. Wired once, it
 * never saw the new page's `.eh-reveal` elements, which the CSS gate had
 * already hidden — so clicking between legal documents showed a blank page.
 *
 * Re-running reverts the previous context (its elements are gone) and wires
 * the new page. The persistent chrome carries no reveal classes, so nothing
 * that survives the navigation is re-hidden.
 */

/** Elements that translate up into place. */
const REVEAL = ".eh-reveal"
/** Elements that slide in horizontally (rails, fanned documents). */
const REVEAL_X = ".eh-reveal-x"
/** Elements that scale in (markers, rings). */
const REVEAL_POP = ".eh-reveal-pop"
/**
 * Masked headline lines. The hero's own lines are excluded: its choreographed
 * entrance timeline already owns them, and animating one element from two
 * places is the rule this codebase does not break.
 */
const HEADLINE = ".eh-line-inner:not(.eh-hero-line)"

export function RevealOrchestrator() {
    const pathname = usePathname()

    useEffect(() => {
        // Gate closed — no JS-driven hiding happened, so there is nothing to
        // un-hide. Content is already visible and must stay that way.
        if (document.documentElement.dataset.ehAnim !== "ready") return
        if (prefersReducedMotion()) return

        const ctx = gsap.context(() => {
            const batchDefaults = {
                start: "top 88%",
                once: true,
            }

            ScrollTrigger.batch(REVEAL, {
                ...batchDefaults,
                onEnter: (batch) =>
                    gsap.to(batch, {
                        opacity: 1,
                        y: 0,
                        duration: DUR.lg,
                        ease: EASE.entrance,
                        stagger: STAGGER.normal,
                        // Hand the element back to CSS once it has arrived, so
                        // hover/focus transitions aren't fighting inline styles.
                        clearProps: "transform",
                    }),
            })

            ScrollTrigger.batch(REVEAL_X, {
                ...batchDefaults,
                onEnter: (batch) =>
                    gsap.to(batch, {
                        opacity: 1,
                        x: 0,
                        duration: DUR.lg,
                        ease: EASE.entrance,
                        stagger: STAGGER.tight,
                        clearProps: "transform",
                    }),
            })

            ScrollTrigger.batch(REVEAL_POP, {
                ...batchDefaults,
                onEnter: (batch) =>
                    gsap.to(batch, {
                        opacity: 1,
                        scale: 1,
                        duration: DUR.md,
                        ease: EASE.entrance,
                        stagger: STAGGER.tight,
                        clearProps: "transform",
                    }),
            })

            // Headlines rise out of their overflow mask, line by line.
            //
            // NOTE THE `fromTo`. The CSS start state is `translate3d(0, 110%, 0)`
            // — a PERCENTAGE. GSAP reads the *computed* transform, which the
            // browser has already resolved to a pixel `matrix()`, so it records
            // `y: <n>px` with `yPercent: 0`. A plain `.to({ yPercent: 0 })` is
            // therefore a no-op: the line never moves and the mask's
            // `overflow: hidden` keeps it invisible for good.
            //
            // Stating the start explicitly makes GSAP own both ends of the
            // tween, so the percentage is never round-tripped through a matrix.
            // (This is why body copy — which starts at `24px`, a unit GSAP can
            // parse back — always appeared while section titles did not.)
            ScrollTrigger.batch(HEADLINE, {
                ...batchDefaults,
                start: "top 90%",
                onEnter: (batch) =>
                    gsap.fromTo(
                        batch,
                        // `y: 0` is not redundant. GSAP decomposes the element's
                        // existing computed matrix into its own transform cache,
                        // so the pixel offset the browser resolved from
                        // `translate3d(0, 110%, 0)` is already sitting in `y`.
                        // Setting only `yPercent` would COMPOSE with it —
                        // translate(0, y + 110%) — and leave the line short by
                        // that many pixels even after the tween finishes.
                        // Zeroing both makes the percentage the only offset.
                        { yPercent: 110, y: 0 },
                        {
                            yPercent: 0,
                            y: 0,
                            duration: 0.9,
                            ease: EASE.entrance,
                            stagger: 0.09,
                        }
                    ),
            })

            // Late-loading fonts and images change element heights, which moves
            // every trigger below them. One refresh after load keeps the start
            // positions honest.
            ScrollTrigger.refresh()
        })

        return () => ctx.revert()
    }, [pathname])

    /**
     * Safety net.
     *
     * If GSAP fails to load, throws, or is stripped by an extension, the CSS
     * hidden state would strand the page's content invisible — the precise
     * failure this component exists to prevent, and one that would only show up
     * in production.
     *
     * The recovery is a single attribute removal. Every hidden rule in the
     * stylesheet is scoped to `html[data-eh-anim="ready"]`, so dropping that
     * attribute instantly restores full visibility across the whole page —
     * no per-element sweep, no inline styles to clean up afterwards.
     *
     * The check is deliberately narrow: it looks only at elements currently
     * *inside the viewport*, which are the ones that should already have been
     * revealed. Content below the fold is legitimately still hidden and waiting
     * for its turn, so it must not trigger the bail-out.
     */
    useEffect(() => {
        if (document.documentElement.dataset.ehAnim !== "ready") return

        const timer = window.setTimeout(() => {
            const candidates = document.querySelectorAll<HTMLElement>(
                `${REVEAL}, ${REVEAL_X}, ${REVEAL_POP}`
            )

            const strandedInView = Array.from(candidates).some((el) => {
                const rect = el.getBoundingClientRect()
                const inView = rect.top < window.innerHeight && rect.bottom > 0
                return inView && window.getComputedStyle(el).opacity === "0"
            })

            // Headlines fail differently: they stay fully opaque but translated
            // out of their mask, so an opacity check would miss them entirely.
            const strandedHeadline = Array.from(
                document.querySelectorAll<HTMLElement>(HEADLINE)
            ).some((el) => {
                const rect = el.getBoundingClientRect()
                const inView = rect.top < window.innerHeight && rect.bottom > 0
                if (!inView) return false
                const t = window.getComputedStyle(el).transform
                // Any non-identity transform still in place means the reveal
                // never ran for this line.
                return t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)"
            })

            if (strandedInView || strandedHeadline) {
                document.documentElement.removeAttribute("data-eh-anim")
            }
        }, 4000)

        return () => window.clearTimeout(timer)
    }, [pathname])

    return null
}
