"use client"

import { useEffect, useRef, useState } from "react"
import { Shell, Heading, Eyebrow, Body, Caveat, Board } from "../components/Primitives"
import { Icon } from "../components/Icon"
import { Reveal } from "../components/Reveal"
import { DOCUMENTS } from "../data/content"
import { DOCUMENT_SPECS } from "../data/documents"
import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/useMotion"

/**
 * Scene 3 — document intelligence.
 *
 * Editorial rather than a feature grid: the documents fan out of a stack as you
 * scroll, a scanning light passes across them, and the findings panel fills in
 * beside them. The argument is "your file is read as a whole", so the visual
 * has to show the documents *together*, not one card per capability.
 *
 * Progress is scroll-linked but nothing is pinned, so the reader is never held.
 *
 * Every document is drawn (see `../data/documents.ts` for why): no crests, no
 * visa stickers, no legible personal data.
 */
export function DocumentIntelligence() {
    const stackRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const el = stackRef.current
        if (!el) return

        if (prefersReducedMotion()) {
            // Show the resolved state immediately: fanned out, findings visible.
            setProgress(1)
            return
        }

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: el,
                start: "top 78%",
                end: "bottom 55%",
                scrub: 0.5,
                onUpdate: (self) => setProgress(self.progress),
            })
        }, el)

        return () => ctx.revert()
    }, [])

    // Findings appear progressively, so the reader isn't handed six
    // conclusions at once.
    const findings = DOCUMENT_SPECS.filter((d) => d.finding)
    const revealedFindings = Math.round(progress * (findings.length + 0.6))

    return (
        <section id="documents" className="eh-scene eh-docs" aria-labelledby="eh-docs-title">
            <Shell>
                <header className="eh-docs-head">
                    <Eyebrow>{DOCUMENTS.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-docs-title">
                        <Heading
                            lines={["Your documents should tell", "one convincing story."]}
                            accent="one convincing story."
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{DOCUMENTS.body}</Body>
                </header>

                <div className="eh-docs-grid">
                    {/* ------------------------------------------- the stack */}
                    <div
                        ref={stackRef}
                        className="eh-docs-stack"
                        style={{ ["--eh-fan" as string]: progress.toFixed(3) }}
                        aria-hidden="true"
                    >
                        {DOCUMENT_SPECS.map((doc, i) => (
                            <article
                                key={doc.id}
                                className="eh-doc"
                                data-tone={doc.tone}
                                data-flagged={doc.finding ? "true" : "false"}
                                style={{ ["--eh-i" as string]: i - (DOCUMENT_SPECS.length - 1) / 2 }}
                            >
                                <header className="eh-doc-head">
                                    <span className="eh-doc-title">{doc.title}</span>
                                    <span className="eh-doc-meta">{doc.meta}</span>
                                </header>

                                <div className="eh-doc-body">
                                    {Array.from({ length: doc.lines }).map((_, r) => (
                                        <i key={r} style={{ width: `${94 - ((r * 13) % 46)}%` }} />
                                    ))}
                                </div>

                                {doc.finding ? (
                                    <span className="eh-doc-flag" data-kind={doc.finding.kind}>
                                        {doc.finding.label}
                                    </span>
                                ) : (
                                    <span className="eh-doc-flag" data-kind="clean">
                                        Reads clean
                                    </span>
                                )}
                            </article>
                        ))}

                        {/* The scanning light. Its position is driven by scroll
                            progress, so it feels like the reader is doing the
                            scanning — not like a looping decoration. */}
                        <span className="eh-doc-scan" />
                    </div>

                    {/* ---------------------------------------- findings panel */}
                    <aside className="eh-docs-panel" aria-label="What the review found">
                        <Board>Review findings · example</Board>

                        <ul className="eh-findings">
                            {findings.map((doc, i) => (
                                <li
                                    key={doc.id}
                                    data-shown={i < revealedFindings ? "true" : "false"}
                                >
                                    <span className="eh-finding-kind" data-kind={doc.finding!.kind}>
                                        {doc.finding!.kind === "gap"
                                            ? "Missing"
                                            : doc.finding!.kind === "conflict"
                                              ? "Conflict"
                                              : "Evidence"}
                                    </span>
                                    <p className="eh-finding-doc">{doc.title}</p>
                                    <p className="eh-finding-detail">{doc.finding!.detail}</p>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>

                {/* ------------------------------------------------- outcomes */}
                <Reveal className="eh-docs-outcomes" stagger={0.07}>
                    {DOCUMENTS.outcomes.map((o) => (
                        <div className="eh-card eh-reveal eh-outcome" key={o.id}>
                            <span className="eh-outcome-icon" aria-hidden="true">
                                <Icon name="scan" size={18} />
                            </span>
                            <h3 className="eh-outcome-title">{o.title}</h3>
                            <p className="eh-outcome-body">{o.body}</p>
                        </div>
                    ))}
                </Reveal>

                <Reveal className="mt-10">
                    <Caveat>{DOCUMENTS.disclaimer}</Caveat>
                </Reveal>
            </Shell>
        </section>
    )
}
