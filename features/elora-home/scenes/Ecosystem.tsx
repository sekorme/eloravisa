"use client"

import { useState } from "react"
import Link from "next/link"
import { Shell, Heading, Eyebrow, Body } from "../components/Primitives"
import { Icon, ArrowRight } from "../components/Icon"
import { ECOSYSTEM } from "../data/content"
import { ECOSYSTEM_TOOLS, ECOSYSTEM_HUB } from "../data/tools"
import { track } from "../adapters/analytics"

/**
 * Scene 8 — the product ecosystem.
 *
 * Not six identical cards: a constellation in which each tool feeds information
 * into the readiness profile at the centre. The edges are *generated from the
 * `feeds` relationships* in `../data/tools.ts` rather than drawn by hand, so
 * the diagram cannot drift out of sync with what it claims — adding a tool adds
 * its real connections automatically.
 *
 * Interaction model, in the order it was built:
 *   1. Every node is a `<Link>` — so it is tabbable, has a real href, and works
 *      with no JavaScript at all.
 *   2. Focus does everything hover does. A keyboard user gets the expansion,
 *      the brightened edges and the benefit text; nothing is mouse-only.
 *   3. Below 900px the constellation is `aria-hidden` decoration and the same
 *      tools render as a plain, scrollable list — because a 6-node force
 *      diagram on a 360px screen is a puzzle, not a navigation aid.
 */
export function Ecosystem() {
    const [activeId, setActiveId] = useState<string | null>(null)

    const active = ECOSYSTEM_TOOLS.find((t) => t.id === activeId)

    // Every directed edge, derived from the data rather than hand-drawn.
    const edges = ECOSYSTEM_TOOLS.flatMap((tool) =>
        tool.feeds.map((targetId) => {
            const target = ECOSYSTEM_TOOLS.find((t) => t.id === targetId)
            if (!target) return null
            return { from: tool, to: target, key: `${tool.id}-${targetId}` }
        })
    ).filter((e): e is NonNullable<typeof e> => e !== null)

    return (
        <section id="tools" className="eh-scene eh-eco" aria-labelledby="eh-eco-title">
            <Shell>
                <header className="eh-eco-head">
                    <Eyebrow>{ECOSYSTEM.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-eco-title">
                        <Heading
                            lines={["Every tool feeds", "the same readiness picture."]}
                            accent="the same readiness picture."
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{ECOSYSTEM.body}</Body>
                </header>

                {/* ------------------------------------------ constellation */}
                <div
                    className="eh-constellation"
                    onMouseLeave={() => setActiveId(null)}
                >
                    <svg
                        className="eh-eco-edges"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        focusable="false"
                    >
                        {edges.map((e) => {
                            const lit =
                                activeId === e.from.id || activeId === e.to.id
                            return (
                                <line
                                    key={e.key}
                                    x1={e.from.x}
                                    y1={e.from.y}
                                    x2={e.to.x}
                                    y2={e.to.y}
                                    className="eh-eco-edge"
                                    data-lit={lit ? "true" : "false"}
                                    // preserveAspectRatio="none" distorts stroke
                                    // width, so it is set in user units and kept
                                    // hairline-thin.
                                    vectorEffect="non-scaling-stroke"
                                />
                            )
                        })}
                    </svg>

                    {ECOSYSTEM_TOOLS.map((tool) => {
                        const isHub = tool.id === ECOSYSTEM_HUB
                        const isActive = activeId === tool.id
                        const isDimmed = activeId !== null && !isActive

                        return (
                            <Link
                                key={tool.id}
                                href={tool.href}
                                className="eh-node"
                                data-hub={isHub ? "true" : "false"}
                                data-active={isActive ? "true" : "false"}
                                data-dimmed={isDimmed ? "true" : "false"}
                                style={{ left: `${tool.x}%`, top: `${tool.y}%` }}
                                onMouseEnter={() => setActiveId(tool.id)}
                                onFocus={() => setActiveId(tool.id)}
                                onBlur={() => setActiveId(null)}
                                onClick={() =>
                                    track("tool_focused", {
                                        label: tool.id,
                                        scene: "ecosystem",
                                    })
                                }
                            >
                                <span className="eh-node-icon" aria-hidden="true">
                                    <Icon name={tool.icon} size={isHub ? 22 : 18} />
                                </span>
                                <span className="eh-node-name">{tool.name}</span>
                                <span className="eh-node-benefit">{tool.benefit}</span>
                            </Link>
                        )
                    })}

                    {/* A single shared caption region so the benefit text is
                        announced once, rather than six competing live regions. */}
                    <p className="eh-eco-caption" aria-live="polite">
                        {active ? `${active.name}: ${active.benefit}` : ""}
                    </p>
                </div>

                {/* ---------------------------------------- mobile fallback */}
                <ul className="eh-eco-list">
                    {ECOSYSTEM_TOOLS.map((tool) => (
                        <li key={tool.id}>
                            <Link
                                href={tool.href}
                                className="eh-card eh-eco-listitem"
                                onClick={() =>
                                    track("tool_focused", {
                                        label: tool.id,
                                        scene: "ecosystem_list",
                                    })
                                }
                            >
                                <span className="eh-node-icon" aria-hidden="true">
                                    <Icon name={tool.icon} size={18} />
                                </span>
                                <span>
                                    <b>{tool.name}</b>
                                    <em>{tool.benefit}</em>
                                </span>
                                <ArrowRight size={16} />
                            </Link>
                        </li>
                    ))}
                </ul>
            </Shell>
        </section>
    )
}
