import Link from "next/link"
import { Shell, Heading, Eyebrow, Body } from "../components/Primitives"
import { Reveal } from "../components/Reveal"
import { Icon, ArrowRight } from "../components/Icon"
import { TRUST } from "../data/content"

/**
 * Scene 9 — privacy and security.
 *
 * Calm and minimal on purpose. Every other scene is arguing; this one is
 * answering a question the visitor is already asking, and the design should
 * feel like a straight answer: quiet type, generous space, no motion beyond a
 * gentle reveal.
 *
 * COMPLIANCE CLAIMS
 * There are none, deliberately. No SOC 2, no ISO 27001, no "GDPR compliant"
 * badge, no encryption specifics — none of that has been verified for this
 * codebase, and a security claim that turns out to be decorative is worse than
 * saying nothing. Each pillar describes a property of how the app is actually
 * built, and the legal pages are linked for the detail.
 *
 * A Server Component: nothing here needs interactivity.
 */
export function Trust() {
    return (
        <section id="privacy" className="eh-scene eh-trust" aria-labelledby="eh-trust-title">
            {/* Security-pattern texture, echoing the passport data page. */}
            <span className="eh-trust-pattern eh-guilloche" aria-hidden="true" />

            <Shell>
                <Reveal>
                    <header className="eh-trust-head">
                        <Eyebrow>{TRUST.eyebrow}</Eyebrow>
                        <div className="mt-4" id="eh-trust-title">
                            <Heading
                                lines={["Your application", "deserves privacy."]}
                                accent="deserves privacy."
                                size="lg"
                            />
                        </div>
                        <Body className="mt-6">{TRUST.body}</Body>
                    </header>

                    <div className="eh-trust-grid">
                        {TRUST.pillars.map((p) => (
                            <div className="eh-reveal eh-trust-pillar" key={p.id}>
                                <span className="eh-trust-icon" aria-hidden="true">
                                    <Icon name="shield" size={18} />
                                </span>
                                <h3>{p.title}</h3>
                                <p>{p.body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="eh-reveal eh-trust-links">
                        {TRUST.links.map((l) => (
                            <Link key={l.href} href={l.href} className="eh-trust-link">
                                {l.label}
                                <ArrowRight size={14} />
                            </Link>
                        ))}
                    </div>
                </Reveal>
            </Shell>
        </section>
    )
}
