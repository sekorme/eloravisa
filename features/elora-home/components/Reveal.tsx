import { createElement, type ReactNode } from "react"

/**
 * A plain layout container.
 *
 * ------------------------------------------------------------------------
 * THIS NO LONGER ANIMATES ANYTHING — AND THAT IS THE FIX
 * ------------------------------------------------------------------------
 * This used to be a client component that animated `.eh-reveal` descendants on
 * scroll. That made revealing *opt-in per scene* while hiding stayed global in
 * CSS, and eight of fourteen scenes never opted in — so their titles and body
 * copy were hidden by the stylesheet and never brought back.
 *
 * Revealing is now handled globally and automatically by
 * `motion/RevealOrchestrator`, which finds every revealable element on the page.
 * A scene can no longer forget to wire itself up.
 *
 * What is left is a dumb container kept for the grid/spacing classNames the
 * scenes already pass it. It ships no JavaScript. The motion-related props are
 * accepted and ignored so existing call sites keep working; delete them at
 * leisure.
 */

type RevealTag = "div" | "section" | "ul" | "ol" | "li" | "header" | "footer" | "aside"

interface RevealProps {
    children: ReactNode
    as?: RevealTag
    className?: string
    /** Accepted and ignored — the orchestrator owns timing now. */
    stagger?: number
    /** Accepted and ignored. */
    selector?: string
    /** Accepted and ignored. */
    y?: number
    /** Accepted and ignored. */
    start?: string
    /** Accepted and ignored. */
    delay?: number
}

export function Reveal({ children, as = "div", className = "" }: RevealProps) {
    return createElement(as, { className }, children)
}
