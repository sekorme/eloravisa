"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useMagnetic } from "../motion/useMotion"
import { track, type HomeEvent } from "../adapters/analytics"

/**
 * The homepage call-to-action.
 *
 * Everything conversion-critical is concentrated here so it can't drift between
 * fourteen scenes: the analytics call, the magnetic pointer affordance, the
 * one-shot sheen, and the guarantee that it renders as a real `<a>` (so
 * middle-click, cmd-click, "copy link" and the browser status bar all work).
 *
 * It is a `Link`, never a `<div onClick>` — a CTA that isn't a link is a CTA
 * keyboard users and screen readers can't use.
 */

interface CtaProps {
    href: string
    children: ReactNode
    variant?: "primary" | "secondary" | "ghost"
    /** Analytics intent. Omit for links that aren't conversion events. */
    event?: HomeEvent
    /** Stable slug for analytics. Never user input. */
    eventLabel?: string
    /** Scene id, for analytics context. */
    scene?: string
    eventValue?: number
    /** Magnetic pull on fine-pointer devices. Off for dense link groups. */
    magnetic?: boolean
    /** Plays the sheen once when the button first scrolls into view. */
    sheen?: boolean
    className?: string
    /** Renders an icon after the label. */
    trailing?: ReactNode
}

export function Cta({
    href,
    children,
    variant = "primary",
    event,
    eventLabel,
    scene,
    eventValue,
    magnetic = false,
    sheen = false,
    className = "",
    trailing,
}: CtaProps) {
    const ref = useRef<HTMLAnchorElement>(null)
    const [sheenOn, setSheenOn] = useState(false)

    useMagnetic(ref, magnetic ? 0.22 : 0)

    /**
     * The sheen fires once, when the button first becomes visible — a moment of
     * light that draws the eye, then stops. A permanently looping sheen reads
     * as a loading skeleton and, on a page this long, becomes visual noise the
     * visitor learns to ignore.
     */
    useEffect(() => {
        if (!sheen) return
        const el = ref.current
        if (!el) return
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                setSheenOn(true)
                io.disconnect()
                // Remove the class after the animation so a re-render can't
                // replay it and so `will-change` isn't left pinned.
                window.setTimeout(() => setSheenOn(false), 1300)
            },
            { threshold: 0.6 }
        )

        io.observe(el)
        return () => io.disconnect()
    }, [sheen])

    const isAnchor = href.startsWith("#")

    const classes = [
        "eh-btn",
        `eh-btn-${variant}`,
        sheenOn ? "eh-btn-sheen" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ")

    const onClick = () => {
        if (event) track(event, { label: eventLabel, scene, value: eventValue })
    }

    // In-page anchors use a plain <a>: Next's Link adds client-side routing
    // semantics that a same-page hash jump neither needs nor benefits from.
    if (isAnchor) {
        return (
            <a ref={ref} href={href} className={classes} onClick={onClick}>
                {children}
                {trailing}
            </a>
        )
    }

    return (
        <Link ref={ref} href={href} className={classes} onClick={onClick}>
            {children}
            {trailing}
        </Link>
    )
}
