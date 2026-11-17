"use client"

import { useEffect, useRef, useState } from "react"
import { gsap, prefersReducedMotion } from "../motion/useMotion"

/**
 * The flight route that threads the homepage together.
 *
 * A dotted route draws itself down the page as the visitor scrolls, with a
 * small plane at its tip. At each checkpoint section the plane passes, a
 * rubber stamp lands beside the heading ("Documents · Checked"…). The route
 * ends on the passport in the final scene, which then shows the stamps it
 * collected (see FinalCta). The visitor has carried the passport through the
 * process.
 *
 * ------------------------------------------------------------------------
 * GEOMETRY IS MEASURED, NOT HARD-CODED
 * ------------------------------------------------------------------------
 * The route is built from the real positions of the checkpoint sections, and
 * rebuilt whenever the page's height or width changes (fonts, images, the
 * accordion-style scenes). Moving or resizing a section can't strand a stamp
 * in the middle of a paragraph.
 *
 * Desktop: the route runs down the right margin and swings in to the empty
 * space beside each section heading. Mobile: a slim line down the left
 * gutter, with a small check mark beside each heading.
 *
 * ------------------------------------------------------------------------
 * PROGRESS FOLLOWS THE READER'S EYE LINE
 * ------------------------------------------------------------------------
 * The plane sits where the route crosses ~55% down the viewport. Every
 * segment of the route only ever moves downward, so "the point at this
 * height" is unambiguous and is found from a sampled lookup table, not by
 * mapping scroll to path length (which would make the plane race across the
 * horizontal swings and crawl down the straights).
 *
 * Decorative and `aria-hidden`. Without JS, under reduced motion, or with
 * the animation gate closed, the route is drawn complete with every stamp in
 * place and no plane — the composition, minus the motion.
 */

interface Stop {
    /** Section id the stamp sits beside. */
    id: string
    top: string
    bottom: string
}

const STOPS: Stop[] = [
    { id: "documents", top: "Documents", bottom: "Checked" },
    { id: "interview", top: "Interview", bottom: "Practised" },
    { id: "roadmap", top: "Roadmap", bottom: "Planned" },
    { id: "destinations", top: "Destination", bottom: "Chosen" },
]

/** Where the plane sits in the viewport, as a fraction of its height. */
const EYE_LINE = 0.55
const MOBILE = 900

interface Geometry {
    width: number
    height: number
    d: string
    mobile: boolean
    stamps: { id: string; x: number; y: number; top: string; bottom: string }[]
}

interface Sample {
    len: number
    x: number
    y: number
}

const relRect = (el: Element, origin: DOMRect) => {
    const r = el.getBoundingClientRect()
    return { top: r.top - origin.top, left: r.left - origin.left, right: r.right - origin.left, bottom: r.bottom - origin.top, width: r.width, height: r.height }
}

function measure(wrap: HTMLElement): Geometry | null {
    const origin = wrap.getBoundingClientRect()
    const width = origin.width
    const height = origin.height
    const mobile = window.innerWidth < MOBILE

    // The content column's right edge, from the first shell in the wrapper.
    const shell = wrap.querySelector(".eh-shell")
    let contentRight = width
    let gutter = 20
    if (shell) {
        const r = relRect(shell, origin)
        const pad = parseFloat(getComputedStyle(shell).paddingRight) || 20
        contentRight = r.right - pad
        gutter = width - contentRight
    }

    const railX = mobile ? Math.max(6, Math.min(12, (width - contentRight) / 2)) : contentRight + gutter / 2
    // Desktop stamps sit inside the column, right-aligned, level with the heading.
    const stampX = contentRight - 64

    const stamps: Geometry["stamps"] = []
    for (const stop of STOPS) {
        const section = document.getElementById(stop.id)
        if (!section) continue
        const head = section.querySelector("header") ?? section
        const h = relRect(head, origin)
        stamps.push({
            id: stop.id,
            x: mobile ? railX : stampX,
            y: mobile ? h.top + 6 : h.top + Math.min(h.height, 220) / 2,
            top: stop.top,
            bottom: stop.bottom,
        })
    }
    if (stamps.length === 0) return null

    // End point: the final scene's passport (desktop), or its heading (mobile).
    const final = wrap.querySelector(".eh-final")
    let end = { x: railX, y: height - 40 }
    if (final) {
        const passport = final.querySelector(".eh-final-passport")
        if (!mobile && passport) {
            const p = relRect(passport, origin)
            // Its CSS transform shifts it; the centre is close enough for a landing.
            end = { x: p.left + p.width / 2, y: p.top + p.height * 0.4 }
        } else {
            const f = relRect(final.querySelector("header, .eh-final-copy") ?? final, origin)
            end = { x: railX, y: f.top + 6 }
        }
    }

    // Build the path. Every cubic has its control points ordered top to
    // bottom, so the route never doubles back vertically (see header note).
    let d = `M ${railX} 0`
    if (mobile) {
        d += ` L ${railX} ${end.y}`
    } else {
        // Each swing touches the stamp heading straight down, so the stamp
        // sits at the innermost point of the curve.
        let y = 0
        for (const s of stamps) {
            const reach = Math.min(170, Math.max(90, (s.y - y) / 2))
            d += ` L ${railX} ${s.y - reach}`
            d += ` C ${railX} ${s.y - reach * 0.5}, ${s.x} ${s.y - reach * 0.3}, ${s.x} ${s.y}`
            d += ` C ${s.x} ${s.y + reach * 0.3}, ${railX} ${s.y + reach * 0.5}, ${railX} ${s.y + reach}`
            y = s.y + reach
        }
        const start = Math.max(y, end.y - Math.max(160, Math.min(320, (end.y - y) / 2)))
        const span = Math.max(1, end.y - start)
        d += ` L ${railX} ${start}`
        d += ` C ${railX} ${start + span * 0.5}, ${end.x} ${start + span * 0.55}, ${end.x} ${end.y}`
    }

    return { width, height, d, mobile, stamps }
}

export function JourneyRoute() {
    const wrapRef = useRef<HTMLDivElement>(null)
    const pathRef = useRef<SVGPathElement>(null)
    const maskRef = useRef<SVGPathElement>(null)
    const planeRef = useRef<SVGGElement>(null)
    const [geo, setGeo] = useState<Geometry | null>(null)
    const [animated, setAnimated] = useState(false)

    // Measure, and re-measure when the page around us changes size.
    useEffect(() => {
        const wrap = wrapRef.current?.parentElement
        if (!wrap) return
        let raf = 0
        const update = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                setAnimated(!prefersReducedMotion() && document.documentElement.dataset.ehAnim === "ready")
                setGeo(measure(wrap))
            })
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(wrap)
        window.addEventListener("resize", update)
        // Fonts change heading heights after first paint.
        document.fonts?.ready.then(update).catch(() => {})
        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            window.removeEventListener("resize", update)
        }
    }, [])

    // Drive the plane, the drawn length and the stamps from scroll.
    useEffect(() => {
        const wrap = wrapRef.current?.parentElement
        const path = pathRef.current
        const mask = maskRef.current
        const plane = planeRef.current
        if (!geo || !wrap || !path || !mask) return

        const final = wrap.querySelector<HTMLElement>(".eh-final")
        const stampEls = Array.from(wrapRef.current!.querySelectorAll<HTMLElement>(".eh-route-stamp"))

        if (!animated) {
            final?.setAttribute("data-route-arrived", "true")
            return
        }

        const total = path.getTotalLength()
        mask.style.strokeDasharray = `${total}`

        // Sample the route once; lookups during scroll are a binary search.
        const samples: Sample[] = []
        const step = 6
        for (let len = 0; len <= total; len += step) {
            const p = path.getPointAtLength(len)
            samples.push({ len, x: p.x, y: p.y })
        }
        const endPt = path.getPointAtLength(total)
        samples.push({ len: total, x: endPt.x, y: endPt.y })

        const lenAtY = (y: number) => {
            if (y <= samples[0].y) return 0
            if (y >= samples[samples.length - 1].y) return total
            let lo = 0
            let hi = samples.length - 1
            while (hi - lo > 1) {
                const mid = (lo + hi) >> 1
                if (samples[mid].y < y) lo = mid
                else hi = mid
            }
            const a = samples[lo]
            const b = samples[hi]
            // Flat stretches (horizontal swing): take the far end so the plane
            // crosses the swing rather than stalling at its start.
            const t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y)
            return a.len + (b.len - a.len) * t
        }

        // Path length at which each stamp is reached.
        const stampLens = geo.stamps.map((s) => lenAtY(s.y))
        const stamped = new Set<number>()
        let arrived = false

        let current = lenAtY(window.innerHeight * EYE_LINE - wrap.getBoundingClientRect().top)
        let target = current

        const render = () => {
            const p = path.getPointAtLength(current)
            const ahead = path.getPointAtLength(Math.min(total, current + 4))
            const behind = path.getPointAtLength(Math.max(0, current - 4))
            const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
            mask.style.strokeDashoffset = `${total - current}`
            if (plane) {
                plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle}) scale(1.45)`)
                plane.style.opacity = current <= 1 || current >= total - 1 ? "0" : "1"
            }

            stampLens.forEach((len, i) => {
                if (!stamped.has(i) && current >= len - 2) {
                    stamped.add(i)
                    stampEls[i]?.setAttribute("data-stamped", "true")
                }
            })
            if (!arrived && current >= total - 2) {
                arrived = true
                final?.setAttribute("data-route-arrived", "true")
            }
        }

        const tick = () => {
            target = lenAtY(window.innerHeight * EYE_LINE - wrap.getBoundingClientRect().top)
            const delta = target - current
            if (Math.abs(delta) < 0.5) {
                if (current !== target) {
                    current = target
                    render()
                }
                return
            }
            // Ease toward the target: smooth, but never more than a beat behind.
            current += delta * 0.16
            render()
        }

        render()
        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
    }, [geo, animated])

    return (
        <div ref={wrapRef} className="eh-route" aria-hidden="true" data-animated={animated ? "true" : "false"}>
            {geo && (
                <>
                    <svg
                        className="eh-route-svg"
                        width={geo.width}
                        height={geo.height}
                        viewBox={`0 0 ${geo.width} ${geo.height}`}
                        fill="none"
                    >
                        <defs>
                            <mask id="eh-route-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={geo.width} height={geo.height}>
                                <path
                                    ref={maskRef}
                                    d={geo.d}
                                    stroke="#fff"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    style={animated ? undefined : { strokeDasharray: "none" }}
                                />
                            </mask>
                        </defs>

                        {/* Faint full route, so the reader can see where it's going. */}
                        <path d={geo.d} className="eh-route-ghost" strokeDasharray="1 9" strokeLinecap="round" />
                        {/* The flown route, revealed up to the plane by the mask. */}
                        <path ref={pathRef} d={geo.d} className="eh-route-line" strokeDasharray="1 7" strokeLinecap="round" mask="url(#eh-route-mask)" />

                        {animated && (
                            <g ref={planeRef} className="eh-route-plane" style={{ opacity: 0 }}>
                                {/* Plane pointing along +x, centred on the route. */}
                                <path d="M10 0 L-4 -9 L-1.5 -1.6 L-9 -2.6 L-11 -6 L-13 -6 L-11.5 0 L-13 6 L-11 6 L-9 2.6 L-1.5 1.6 L-4 9 Z" />
                            </g>
                        )}
                    </svg>

                    {geo.stamps.map((s) => (
                        <div
                            key={s.id}
                            className="eh-route-stamp"
                            data-mobile={geo.mobile ? "true" : "false"}
                            data-stamped={animated ? "false" : "true"}
                            style={{ left: s.x, top: s.y }}
                        >
                            {geo.mobile ? (
                                <span className="eh-route-tick">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="m2 5.2 2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            ) : (
                                <span className="eh-route-seal">
                                    <span className="eh-route-seal-top">{s.top}</span>
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="m5 11.5 4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="eh-route-seal-bottom">{s.bottom}</span>
                                </span>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}
