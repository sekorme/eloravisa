import type { ReactNode } from "react"
import "./styles/elora-home.css"

import { AnimationGate } from "./motion/AnimationGate"
import { RevealOrchestrator } from "./motion/RevealOrchestrator"
import { Navigation } from "./scenes/Navigation"
import { Footer } from "./scenes/Footer"

/**
 * The shared public-site chrome: one navigation bar, one footer, everywhere.
 *
 * ------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ------------------------------------------------------------------------
 * The homepage shipped with its own navigation and footer while every other
 * public page (`about`, `how-it-works`, `pricing`, `resources`, `ai-tools`,
 * `visa-guidance`) kept the older `LandingNavbar` + landing `Footer` through
 * `MarketingPageShell`. Two different headers on one site is a broken seam:
 * different logo lockups, different link sets, different scroll behaviour, and
 * a footer whose legal disclaimer only appeared on some pages.
 *
 * So the chrome is factored out here and both entry points use it — the
 * homepage via `EloraHome`, everything else via `MarketingPageShell`. There is
 * now exactly one place to change a nav link or a footer column.
 *
 * It also brings the pieces that have to wrap the whole document rather than a
 * single scene:
 *   - `AnimationGate`, which must run before any `.eh-reveal` is parsed;
 *   - `RevealOrchestrator`, which wires every revealable element on the page;
 *   - the skip link and the `<main>` landmark.
 *
 * `data-elora-home` scopes the design tokens. Everything inside inherits the
 * white/green/gold surface, which is why the marketing pages now match the
 * homepage instead of sitting on the old theme.
 */
export function SiteChrome({
    children,
    navTone = "light",
}: {
    children: ReactNode
    /** What the transparent nav sits over. See `Navigation`. */
    navTone?: "light" | "dark"
}) {
    return (
        <div data-elora-home>
            {/* First in the body on purpose: it sets the pre-paint animation
                start state before any `.eh-reveal` element is parsed. */}
            <AnimationGate />
            <RevealOrchestrator />

            <a className="eh-skip" href="#eh-main">
                Skip to main content
            </a>

            <Navigation tone={navTone} />

            <main id="eh-main" className="eh-main">
                {children}
            </main>

            <Footer />
        </div>
    )
}
