"use client"

import { Shell, Eyebrow, Heading, Body } from "../components/Primitives"
import { ArrowRight } from "../components/Icon"
import { COMMUNITY } from "../data/content"
import { track } from "../adapters/analytics"

/**
 * Community band — the public Telegram channel.
 *
 * Sits after Live Classes: having said "humans, not only software", this is
 * the always-on version of that. A plain external `<a>` rather than `Cta`
 * because it leaves the site and opens in a new tab, which `Cta` (a Next
 * `Link`) doesn't do.
 */
export function Community() {
    return (
        <section className="eh-scene eh-community" aria-labelledby="eh-community-title">
            <Shell>
                <div className="eh-community-card">
                    <span className="eh-community-mark" aria-hidden="true">
                        <TelegramGlyph />
                    </span>

                    <div className="eh-community-copy">
                        <Eyebrow>{COMMUNITY.eyebrow}</Eyebrow>
                        <div className="mt-3" id="eh-community-title">
                            <Heading lines={[COMMUNITY.headline]} accent="on Telegram." size="md" />
                        </div>
                        <Body className="mt-4">{COMMUNITY.body}</Body>
                    </div>

                    <div className="eh-community-action">
                        <a
                            href={COMMUNITY.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="eh-btn eh-btn-primary eh-community-btn"
                            onClick={() => track("community_joined", { label: "telegram_channel", scene: "community" })}
                        >
                            <TelegramGlyph size={18} />
                            {COMMUNITY.cta.label}
                            <ArrowRight />
                            <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        <p className="eh-community-note">{COMMUNITY.note}</p>
                    </div>
                </div>
            </Shell>
        </section>
    )
}

/** Telegram's paper-plane mark, drawn on the icon set's 24px grid. */
function TelegramGlyph({ size = 28 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M21.43 4.13a1.2 1.2 0 0 0-1.25-.18L3.06 10.7c-.98.39-.95 1.79.05 2.13l4.2 1.43 1.62 5.06c.24.76 1.2.98 1.75.4l2.37-2.48 4.27 3.15c.66.49 1.6.12 1.77-.68l2.75-14.46a1.2 1.2 0 0 0-.41-1.12Zm-4.1 3.6-7.6 6.9a.6.6 0 0 0-.19.37l-.35 2.5-1.03-3.3 9.01-6.66c.25-.19.42.04.16.19Z" />
        </svg>
    )
}
