"use client"

import Image from "next/image"
import { useId, useState } from "react"
import { Shell, Heading, Eyebrow, Body } from "../components/Primitives"
import { AUDIENCES } from "../data/audiences"
import { AUDIENCE } from "../data/content"

/**
 * "Who is this for" — the four applicant situations.
 *
 * ------------------------------------------------------------------------
 * THE INTERACTION
 * ------------------------------------------------------------------------
 * On desktop this is a row of four photographic panels. The selected one
 * expands to take most of the row and reveals its copy; the others narrow to a
 * column with the title set vertically. Selection follows hover *and* focus,
 * and every panel is a real `<button>` with `aria-expanded` — so a keyboard
 * user gets exactly what a mouse user gets, in the same order.
 *
 * Below 900px the accordion is abandoned rather than shrunk: four collapsed
 * slivers on a phone is a puzzle, not a layout. Every panel renders open as a
 * normal stacked card, which is also why the body copy lives in the DOM at all
 * times instead of being mounted on expand — it stays readable and searchable
 * regardless of which panel happens to be selected.
 *
 * The width animation is a CSS `flex` transition on the panels, so the whole
 * thing runs on the compositor with no JavaScript per frame. The only state is
 * which id is active.
 */
export function Audiences() {
    const [activeId, setActiveId] = useState(AUDIENCES[0].id)
    const groupId = useId()

    return (
        <section
            id="who-is-this-for"
            className="eh-scene eh-aud"
            aria-labelledby="eh-aud-title"
        >
            <Shell>
                <header className="eh-aud-head">
                    <Eyebrow>{AUDIENCE.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-aud-title">
                        <Heading
                            lines={["Who is this for?"]}
                            accent="for?"
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{AUDIENCE.body}</Body>
                </header>

                <div className="eh-aud-rail" role="group" aria-label="Applicant situations">
                    {AUDIENCES.map((a) => {
                        const isActive = a.id === activeId
                        const panelId = `${groupId}-${a.id}`

                        return (
                            <button
                                key={a.id}
                                type="button"
                                className="eh-aud-panel eh-reveal"
                                data-active={isActive ? "true" : "false"}
                                aria-expanded={isActive}
                                aria-controls={panelId}
                                onClick={() => setActiveId(a.id)}
                                onMouseEnter={() => setActiveId(a.id)}
                                onFocus={() => setActiveId(a.id)}
                            >
                                <Image
                                    src={a.image.src}
                                    alt={a.image.alt}
                                    width={a.image.width}
                                    height={a.image.height}
                                    sizes="(max-width: 900px) 92vw, 45vw"
                                    loading="lazy"
                                    className="eh-aud-photo"
                                />

                                {/* The wash that keeps the copy legible over a
                                    photograph. Deepens as the panel opens. */}
                                <span className="eh-aud-scrim" aria-hidden="true" />

                                {/* The collapsed state: index plus a vertical
                                    title, so a narrow panel still says what it
                                    is rather than being an anonymous sliver. */}
                                <span className="eh-aud-spine" aria-hidden="true">
                                    <span className="eh-aud-index">{a.index}</span>
                                    <span className="eh-aud-spine-title">{a.title}</span>
                                </span>

                                <span className="eh-aud-content" id={panelId}>
                                    <span className="eh-aud-index-open" aria-hidden="true">
                                        {a.index}
                                    </span>
                                    <span className="eh-aud-title">{a.title}</span>
                                    <span className="eh-aud-tagline">{a.tagline}</span>
                                    <span className="eh-aud-body">{a.body}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>
            </Shell>
        </section>
    )
}
