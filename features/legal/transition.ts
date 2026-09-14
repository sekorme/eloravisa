"use client"

/**
 * Animated navigation between the legal documents, using the browser's View
 * Transitions API.
 *
 * ------------------------------------------------------------------------
 * HOW IT WORKS
 * ------------------------------------------------------------------------
 * `document.startViewTransition` snapshots the page, runs an update callback,
 * then animates from the snapshot to the new state. The callback has to
 * resolve only once the NEW page is in the DOM, but `router.push` returns
 * before that happens. So the callback parks a resolver here and the incoming
 * page releases it from `LegalTransitionSettle`'s layout effect, which runs
 * right after React commits the new document.
 *
 * A timeout releases it anyway, so a slow route (a cold dev compile, a flaky
 * connection) can never leave the page frozen on the old snapshot.
 *
 * ------------------------------------------------------------------------
 * WHAT ANIMATES, AND WHO OWNS IT
 * ------------------------------------------------------------------------
 *   - the page cross-fades (the `root` group, see legal.css);
 *   - for a tab click, the dark active pill slides to the new tab;
 *   - the new document's headline, lead and sections still make their normal
 *     entrance through the global RevealOrchestrator. The new view is live
 *     during the transition, so those entrances play inside it.
 *
 * Why the classes on <html>: they scope every `::view-transition-*` rule to
 * this one transition, so no other page inherits the timings. And the pill
 * only gets a `view-transition-name` for tab clicks. From the "Other
 * documents" links at the bottom of the page the pill is off-screen, and a
 * named pill would fly in from above the viewport.
 *
 * Skipped (plain navigation) when the API is missing or the visitor prefers
 * reduced motion.
 */

const SETTLE_TIMEOUT_MS = 1500
const ROOT_CLASS = "eh-legal-vt"
const TABS_CLASS = "eh-legal-vt-tabs"

let settlePending: (() => void) | null = null

/** Called by the incoming document once it has committed. */
export function settleLegalTransition() {
    settlePending?.()
}

export function startLegalTransition(navigate: () => void, { fromTabs = false } = {}) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (typeof document.startViewTransition !== "function" || reduced) {
        navigate()
        return
    }

    // A second click mid-transition: release the first one straight away.
    settleLegalTransition()

    const html = document.documentElement
    html.classList.add(ROOT_CLASS)
    html.classList.toggle(TABS_CLASS, fromTabs)

    const transition = document.startViewTransition(
        () =>
            new Promise<void>((resolve) => {
                const done = () => {
                    window.clearTimeout(timer)
                    if (settlePending === done) settlePending = null
                    resolve()
                }
                const timer = window.setTimeout(done, SETTLE_TIMEOUT_MS)
                settlePending = done
                navigate()
            })
    )

    transition.finished.finally(() => {
        html.classList.remove(ROOT_CLASS, TABS_CLASS)
    })
}
