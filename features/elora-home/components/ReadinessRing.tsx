"use client"

import { useEffect, useRef, useState } from "react"
import { gsap, prefersReducedMotion, DUR, EASE } from "../motion/useMotion"

/**
 * The readiness ring — the page's recurring "where do I actually stand" motif.
 *
 * Two accessibility decisions worth keeping:
 *
 *  1. The value is exposed as a `meter`-like role with explicit min/max/now,
 *     so a screen reader announces "82 percent, Application readiness" rather
 *     than reading a decorative SVG.
 *  2. The number is also printed as text in the middle of the ring. The arc is
 *     reinforcement, not the only carrier of the value — nothing here is
 *     communicated by colour or shape alone.
 *
 * Under reduced motion the arc renders at its final length immediately and the
 * number is printed rather than counted. No information is withheld.
 */

interface ReadinessRingProps {
    value: number
    label: string
    size?: number
    /** Adds the ambient pulse behind the ring. */
    pulse?: boolean
    /** Labels the value as illustrative rather than the visitor's own. */
    sampleNote?: string
}

export function ReadinessRing({
    value,
    label,
    size = 132,
    pulse = false,
    sampleNote,
}: ReadinessRingProps) {
    const ref = useRef<HTMLDivElement>(null)
    const arcRef = useRef<SVGCircleElement>(null)
    const [display, setDisplay] = useState(value)

    const stroke = Math.max(5, Math.round(size * 0.055))
    const radius = (size - stroke) / 2 - 2
    const circumference = 2 * Math.PI * radius

    useEffect(() => {
        const host = ref.current
        const arc = arcRef.current
        if (!host || !arc) return

        const finalOffset = circumference * (1 - value / 100)

        if (prefersReducedMotion()) {
            gsap.set(arc, { strokeDashoffset: finalOffset })
            setDisplay(value)
            return
        }

        const counter = { n: 0 }
        const ctx = gsap.context(() => {
            gsap.set(arc, { strokeDashoffset: circumference })
            const tl = gsap.timeline({
                scrollTrigger: { trigger: host, start: "top 88%", once: true },
            })
            tl.to(arc, {
                strokeDashoffset: finalOffset,
                duration: DUR.xxl,
                ease: EASE.out,
            }).to(
                counter,
                {
                    n: value,
                    duration: DUR.xxl,
                    ease: EASE.out,
                    onUpdate: () => setDisplay(Math.round(counter.n)),
                },
                0
            )
        }, host)

        return () => ctx.revert()
    }, [value, circumference])

    return (
        <div ref={ref} className="relative inline-flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                {pulse ? (
                    <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-1/2 rounded-full"
                        style={{
                            width: size * 0.9,
                            height: size * 0.9,
                            marginLeft: -(size * 0.45),
                            marginTop: -(size * 0.45),
                            background:
                                "radial-gradient(circle, rgb(46 155 114 / 0.28), transparent 68%)",
                            animation: "eh-pulse-ring 3.6s var(--eh-ease-out) infinite",
                        }}
                    />
                ) : null}

                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    aria-hidden="true"
                    focusable="false"
                    style={{ transform: "rotate(-90deg)", position: "relative" }}
                >
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--eh-line)"
                        strokeWidth={stroke}
                    />
                    {/* Value arc */}
                    <circle
                        ref={arcRef}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="url(#eh-ring-grad)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - value / 100)}
                    />
                    <defs>
                        <linearGradient id="eh-ring-grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="var(--eh-green-400)" />
                            <stop offset="60%" stopColor="var(--eh-green-600)" />
                            <stop offset="100%" stopColor="var(--eh-ng-500)" />
                        </linearGradient>
                    </defs>
                </svg>

                <div
                    className="absolute inset-0 grid place-items-center"
                    role="meter"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={label}
                >
                    <div className="text-center leading-none">
                        <span
                            style={{
                                fontFamily: "var(--eh-font-display)",
                                fontSize: size * 0.28,
                                color: "var(--eh-fg)",
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {display}
                        </span>
                        <span
                            aria-hidden="true"
                            style={{
                                fontFamily: "var(--eh-font-mono)",
                                fontSize: size * 0.1,
                                color: "var(--eh-fg-subtle)",
                                marginLeft: 2,
                            }}
                        >
                            %
                        </span>
                    </div>
                </div>
            </div>

            <span className="eh-board" style={{ letterSpacing: "0.14em" }}>
                {label}
            </span>
            {sampleNote ? (
                <span
                    style={{
                        fontSize: "var(--eh-text-xs)",
                        color: "var(--eh-fg-subtle)",
                    }}
                >
                    {sampleNote}
                </span>
            ) : null}
        </div>
    )
}
