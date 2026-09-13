import Image from "next/image"
import { Shell, Heading, Eyebrow, Body, Board } from "../components/Primitives"
import { Reveal } from "../components/Reveal"
import { VOICES } from "../data/content"
import type { Testimonial } from "../types"
import type { VerifiedMetric } from "../adapters/proof"

/**
 * Scene 10 — applicant voices and verified activity.
 *
 * ------------------------------------------------------------------------
 * THE PUBLISHING RULE
 * ------------------------------------------------------------------------
 * This scene renders exactly what exists and nothing else:
 *
 *   - `metrics` are aggregate Firestore counts. Activity counts only — how many
 *     people have a workspace, how many documents were reviewed. Never an
 *     approval rate, because Elora does not observe application outcomes and
 *     any "success rate" on this page would be fabricated.
 *   - `testimonials` come from a consented, human-reviewed source. There isn't
 *     one yet, so the array is empty.
 *
 * When both are empty in production, the whole section is omitted rather than
 * padded with plausible-looking filler. In development a visible placeholder
 * shows the layout so it can be designed against — and it is gated on
 * `NODE_ENV`, so it can never ship.
 *
 * Portraits: a testimonial's portrait must be a licensed photograph of that
 * actual person. Attaching stock photography to a named quote is fabrication
 * even when the quote is real, so `portrait` is optional and the layout is
 * designed to look right without one.
 */

interface VoicesProps {
    testimonials: Testimonial[]
    metrics: VerifiedMetric[]
}

export function Voices({ testimonials, metrics }: VoicesProps) {
    const isDev = process.env.NODE_ENV !== "production"
    const hasContent = testimonials.length > 0 || metrics.length > 0

    // Nothing verified to show, and not a development build: render nothing.
    if (!hasContent && !isDev) return null

    return (
        <section id="voices" className="eh-scene eh-voices" aria-labelledby="eh-voices-title">
            <Shell>
                <Reveal>
                    <header className="eh-voices-head">
                        <Eyebrow>{VOICES.eyebrow}</Eyebrow>
                        <div className="mt-4" id="eh-voices-title">
                            <Heading
                                lines={["Real experiences,", "published only with consent."]}
                                size="md"
                            />
                        </div>
                        <Body className="mt-6">{VOICES.body}</Body>
                    </header>

                    {/* ------------------------------------ verified metrics */}
                    {metrics.length > 0 ? (
                        <dl className="eh-metrics">
                            {metrics.map((m) => (
                                <div className="eh-reveal eh-metric" key={m.id}>
                                    <dt className="eh-metric-value">
                                        {m.value.toLocaleString()}
                                    </dt>
                                    <dd>
                                        <span className="eh-metric-label">{m.label}</span>
                                        {/* Says exactly what the number counts,
                                            so it can't be read as an outcome. */}
                                        <span className="eh-metric-caption">{m.caption}</span>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}

                    {/* --------------------------------------- testimonials */}
                    {testimonials.length > 0 ? (
                        <ul className="eh-testimonials">
                            {testimonials.map((t) => (
                                <li className="eh-reveal eh-testimonial" key={t.id}>
                                    <blockquote>
                                        <p>{t.quote}</p>
                                    </blockquote>
                                    <footer className="eh-testimonial-foot">
                                        {t.portrait ? (
                                            <Image
                                                src={t.portrait.src}
                                                alt={t.portrait.alt}
                                                width={44}
                                                height={44}
                                                className="eh-testimonial-portrait"
                                            />
                                        ) : null}
                                        <span>
                                            <b>{t.name}</b>
                                            <em>
                                                {t.visaCategory} · {t.destination}
                                            </em>
                                            <span className="eh-testimonial-feature">
                                                Used {t.feature}
                                            </span>
                                        </span>
                                    </footer>
                                </li>
                            ))}
                        </ul>
                    ) : isDev ? (
                        /* Development-only. Never rendered in production — see
                           the NODE_ENV guard above. */
                        <div className="eh-placeholder" role="note">
                            <Board>Development placeholder, not shown in production</Board>
                            <p>
                                No verified testimonials are available. This block marks where
                                consented applicant stories will render once{" "}
                                <code>getTestimonials()</code> in{" "}
                                <code>features/elora-home/adapters/proof.ts</code> returns data.
                                Nothing is published until a real, consented source exists.
                            </p>
                        </div>
                    ) : null}
                </Reveal>
            </Shell>
        </section>
    )
}
