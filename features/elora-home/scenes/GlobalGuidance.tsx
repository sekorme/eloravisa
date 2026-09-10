"use client"

import { useId, useState } from "react"
import { Shell, Heading, Eyebrow, Body, Caveat, Board } from "../components/Primitives"
import { Cta } from "../components/Cta"
import { ArrowRight } from "../components/Icon"
import { Horizon, project } from "../components/Horizon"
import { GlobeLayer } from "../components/GlobeLayer"
import Image from "next/image"
import { GLOBAL } from "../data/content"
import { DESTINATION_IMAGE } from "../data/media"
import { DESTINATIONS } from "../data/destinations"
import { destinationGuideHref } from "../adapters/routes"
import { track } from "../adapters/analytics"

/**
 * Scene 6 — destination guidance.
 *
 * ------------------------------------------------------------------------
 * WHY THE MARKERS ARE BUTTONS
 * ------------------------------------------------------------------------
 * The obvious build for "interactive globe" is hover handlers on SVG circles.
 * That produces something a mouse user can explore and nobody else can: no tab
 * stop, no Enter key, no screen-reader announcement, no touch target.
 *
 * So the globe is rendered as the decorative layer, and a real `<button>` is
 * positioned over each marker — same projection maths, actual semantics. Tab
 * moves between destinations, Enter and Space select, the panel is a live
 * region, and every button carries a 44px hit area even though the visible
 * marker is small. Hover is an enhancement on top of a keyboard-complete
 * control, which is the right order to build these in.
 *
 * Content rule: this scene describes *preparation*, never processing times,
 * fees or eligibility. See `../data/destinations.ts`.
 */

const CX = 300
const CY = 300
const R = 232

export function GlobalGuidance() {
    const [selectedId, setSelectedId] = useState(DESTINATIONS[0].id)
    const panelId = useId()

    const selected = DESTINATIONS.find((d) => d.id === selectedId) ?? DESTINATIONS[0]

    const select = (id: string, name: string) => {
        setSelectedId(id)
        track("destination_selected", { label: id, scene: "global" })
        void name
    }

    return (
        <section id="destinations" className="eh-scene eh-global" aria-labelledby="eh-global-title">
            <Shell>
                <header className="eh-global-head">
                    <Eyebrow>{GLOBAL.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-global-title">
                        <Heading
                            lines={["Guidance shaped", "around your destination."]}
                            accent="around your destination."
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{GLOBAL.body}</Body>
                </header>

                <div className="eh-global-grid">
                    {/* --------------------------------------------- globe */}
                    <div className="eh-global-globe">
                        <div className="eh-global-globe-inner">
                            <Horizon className="eh-global-horizon" />
                            {/* The Three.js globe crossfades over the SVG on
                                capable desktops, after idle. This is the scene
                                where real depth earns its bundle: markers must
                                occlude behind the limb and arcs must lift off a
                                curved surface. See GlobeLayer for the gate. */}
                            <GlobeLayer />

                            {/* Marker layer — a REDUNDANT pointer affordance.
                                Orthographic projection hides whatever is on the
                                far side of the globe, so Australia (lon 149°,
                                against a centre of −10°) has no marker at all.
                                If these were the only control, that destination
                                would be unreachable.

                                So the markers are `aria-hidden` and removed from
                                the tab order: they mirror the selector below,
                                which always lists every destination. Mouse users
                                get to click the globe; nobody depends on it. */}
                            <div className="eh-global-markers" aria-hidden="true">
                                {DESTINATIONS.map((d) => {
                                    const p = project(d.lat, d.lon, CX, CY, R)
                                    if (!p) return null
                                    const isSelected = d.id === selectedId
                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            tabIndex={-1}
                                            className="eh-global-marker"
                                            data-selected={isSelected ? "true" : "false"}
                                            style={{
                                                left: `${(p.x / 600) * 100}%`,
                                                top: `${(p.y / 600) * 100}%`,
                                            }}
                                            onClick={() => select(d.id, d.name)}
                                            onMouseEnter={() => setSelectedId(d.id)}
                                        >
                                            <span className="eh-global-marker-hit" />
                                            <span className="eh-global-marker-ring" />
                                            <span className="eh-global-marker-label">{d.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* The actual control. Every destination, always
                            present, keyboard-complete, 44px targets. */}
                        <div
                            className="eh-global-tabs"
                            role="group"
                            aria-label="Choose a destination"
                        >
                            {DESTINATIONS.map((d) => {
                                const isSelected = d.id === selectedId
                                return (
                                    <button
                                        key={d.id}
                                        type="button"
                                        className="eh-global-tab"
                                        data-selected={isSelected ? "true" : "false"}
                                        aria-pressed={isSelected}
                                        aria-controls={panelId}
                                        onClick={() => select(d.id, d.name)}
                                        onMouseEnter={() => setSelectedId(d.id)}
                                        onFocus={() => setSelectedId(d.id)}
                                    >
                                        <span className="eh-global-tab-code">{d.code}</span>
                                        {d.name}
                                    </button>
                                )
                            })}
                        </div>

                        {/* The arrival beat. Captioned "Arriving" and nothing
                            more — this is a photograph of a street, not evidence
                            of an approved application, and must never be
                            captioned as one. */}
                        <figure className="eh-global-photo">
                            <Image
                                src={DESTINATION_IMAGE.src}
                                alt={DESTINATION_IMAGE.alt}
                                width={DESTINATION_IMAGE.width}
                                height={DESTINATION_IMAGE.height}
                                sizes="(max-width: 1020px) 90vw, 30vw"
                                loading="lazy"
                            />
                            <figcaption>{DESTINATION_IMAGE.caption}</figcaption>
                        </figure>
                    </div>

                    {/* --------------------------------------------- panel */}
                    <aside
                        id={panelId}
                        className="eh-global-panel"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <Board>
                            {selected.code} · Destination preparation
                        </Board>

                        <h3 className="eh-global-panel-title">{selected.name}</h3>

                        <div className="eh-global-block">
                            <h4>Common visa categories</h4>
                            <ul className="eh-chiplist">
                                {selected.categories.map((c) => (
                                    <li key={c}>{c}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="eh-global-block">
                            <h4>What Elora helps you prepare</h4>
                            <ul className="eh-bulletlist">
                                {selected.preparation.map((p) => (
                                    <li key={p}>{p}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="eh-global-row">
                            <div className="eh-global-block">
                                <h4>Interview relevance</h4>
                                <p className="eh-global-value">{selected.interviewRelevance}</p>
                            </div>
                            <div className="eh-global-block">
                                <h4>Document focus</h4>
                                <p className="eh-global-value">
                                    {selected.documents.join(" · ")}
                                </p>
                            </div>
                        </div>

                        <Cta
                            href={destinationGuideHref()}
                            variant="secondary"
                            event="destination_guide_opened"
                            eventLabel={selected.id}
                            scene="global"
                            className="mt-6"
                            trailing={<ArrowRight size={16} />}
                        >
                            {GLOBAL.guideCta}
                        </Cta>
                    </aside>
                </div>

                <div className="mt-10">
                    <Caveat>{GLOBAL.disclaimer}</Caveat>
                </div>
            </Shell>
        </section>
    )
}
