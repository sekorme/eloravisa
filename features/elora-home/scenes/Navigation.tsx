"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { BrandLogo } from "../components/Primitives"
import { Cta } from "../components/Cta"
import { ArrowRight } from "../components/Icon"
import { NAV_LINKS, NAV_CTA } from "../data/content"
import { track } from "../adapters/analytics"
import { useReducedMotion } from "../motion/useMotion"

/**
 * Site navigation.
 *
 * Desktop: transparent over the hero, then condenses into a compact blurred
 * bar once the visitor has committed to scrolling. The transition is driven by
 * a single boolean and expressed entirely in CSS transitions on the bar — no
 * per-frame React state, so scrolling stays cheap.
 *
 * Mobile: a full-screen drawer implemented as a proper modal dialog — focus
 * trapped, Escape closes, background scroll locked, focus returned to the
 * trigger on close. A nav drawer that leaks focus to the page behind it is
 * unusable with a screen reader, and that is the single most common failure in
 * animated mobile menus.
 */

const SCROLL_THRESHOLD = 24

/**
 * `tone` describes what the bar sits over while it is still transparent:
 *   "light" — the homepage, whose hero is a white/scrimmed surface.
 *   "dark"  — the marketing pages, whose hero is a navy-green band.
 *
 * Without it the nav's default dark-green link colour is all but invisible on
 * a dark hero. The tone only applies while transparent; once the bar condenses
 * into its white surface it reverts to the standard colours automatically.
 */
export function Navigation({ tone = "light" }: { tone?: "light" | "dark" }) {
    const [condensed, setCondensed] = useState(false)
    const [open, setOpen] = useState(false)
    const reduced = useReducedMotion()

    const triggerRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    /* ---------------------------------------------------------------- scroll */

    useEffect(() => {
        // rAF-throttled so a fast scroll can't queue more work than it can paint.
        let ticking = false

        const onScroll = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(() => {
                setCondensed(window.scrollY > SCROLL_THRESHOLD)
                ticking = false
            })
        }

        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    /* ------------------------------------------------------------- drawer a11y */

    const close = useCallback(() => {
        setOpen(false)
        // Return focus to the control that opened the drawer, or the keyboard
        // user is dropped back at the top of the document with no context.
        triggerRef.current?.focus()
    }, [])

    useEffect(() => {
        if (!open) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                close()
                return
            }

            if (e.key !== "Tab") return

            // Focus trap.
            const panel = panelRef.current
            if (!panel) return
            const focusable = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
            )
            if (focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener("keydown", onKeyDown)

        // Move focus into the drawer once it exists.
        const raf = requestAnimationFrame(() => {
            panelRef.current
                ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
                ?.focus()
        })

        return () => {
            document.removeEventListener("keydown", onKeyDown)
            document.body.style.overflow = previousOverflow
            cancelAnimationFrame(raf)
        }
    }, [open, close])

    /* -------------------------------------------------------------------- ui */

    return (
        <>
            <header
                data-condensed={condensed ? "true" : "false"}
                data-tone={tone}
                className="eh-nav"
                style={{ zIndex: "var(--eh-z-nav)" }}
            >
                <nav className="eh-nav-inner" aria-label="Primary">
                    <Link
                        href="/"
                        className="eh-nav-brand"
                        aria-label="Elora Visa home"
                    >
                        <BrandLogo size={condensed ? 30 : 34} />
                    </Link>

                    <ul className="eh-nav-links">
                        {NAV_LINKS.map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} className="eh-nav-link">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="eh-nav-actions">
                        <Link
                            href={NAV_CTA.signIn.href}
                            className="eh-nav-link eh-nav-signin"
                            onClick={() => track("sign_in", { scene: "nav", label: "nav_sign_in" })}
                        >
                            {NAV_CTA.signIn.label}
                        </Link>
                        <Cta
                            href={NAV_CTA.primary.href}
                            variant="primary"
                            event="nav_cta"
                            eventLabel="nav_start_preparing"
                            scene="nav"
                            className="eh-nav-cta"
                        >
                            {NAV_CTA.primary.label}
                        </Cta>

                        <button
                            ref={triggerRef}
                            type="button"
                            className="eh-nav-burger"
                            aria-expanded={open}
                            aria-controls="eh-mobile-nav"
                            onClick={() => setOpen(true)}
                        >
                            <span className="eh-sr">Open navigation menu</span>
                            <span aria-hidden="true" className="eh-burger-bars">
                                <span />
                                <span />
                            </span>
                        </button>
                    </div>
                </nav>
            </header>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        id="eh-mobile-nav"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site navigation"
                        className="eh-drawer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div ref={panelRef} className="eh-drawer-panel">
                            <div className="eh-drawer-top">
                                <BrandLogo size={32} />
                                <button
                                    type="button"
                                    className="eh-drawer-close"
                                    onClick={close}
                                >
                                    <span className="eh-sr">Close navigation menu</span>
                                    <span aria-hidden="true">✕</span>
                                </button>
                            </div>

                            <ul className="eh-drawer-links">
                                {NAV_LINKS.map((link, i) => (
                                    <motion.li
                                        key={link.label}
                                        initial={reduced ? false : { opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: reduced ? 0 : 0.06 + i * 0.05,
                                            duration: 0.4,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        <Link href={link.href} onClick={close}>
                                            <span>{link.label}</span>
                                            <ArrowRight size={18} />
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="eh-drawer-actions">
                                <Cta
                                    href={NAV_CTA.primary.href}
                                    variant="primary"
                                    event="nav_cta"
                                    eventLabel="drawer_start_preparing"
                                    scene="nav"
                                    className="w-full"
                                >
                                    {NAV_CTA.primary.label}
                                </Cta>
                                <Cta
                                    href={NAV_CTA.signIn.href}
                                    variant="secondary"
                                    event="sign_in"
                                    eventLabel="drawer_sign_in"
                                    scene="nav"
                                    className="w-full"
                                >
                                    {NAV_CTA.signIn.label}
                                </Cta>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    )
}
