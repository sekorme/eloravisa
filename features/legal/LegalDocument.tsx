import type { CSSProperties, ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown, Link2 } from "lucide-react"
import { ROUTES } from "@/features/elora-home/adapters/routes"
import { LegalContents } from "./LegalContents"
import { LegalLink, LegalTransitionSettle } from "./LegalLink"
import { LegalProgress } from "./LegalProgress"
import { LEGAL_DOCS, SUPPORT_EMAIL, type LegalDocKey } from "./registry"
import "./legal.css"

export interface LegalSection {
    /** Anchor id. Some are linked from elsewhere (e.g. `#ai-processing`), so don't rename casually. */
    id: string
    title: string
    body: ReactNode
}

interface LegalDocumentProps {
    doc: LegalDocKey
    lead: string
    /**
     * ISO date (YYYY-MM-DD) the wording last materially changed. Bump it by
     * hand when the text changes — never derive it from the current date,
     * which would claim every visit that the document was just revised.
     */
    updated: string
    sections: readonly LegalSection[]
}

const pad = (n: number) => String(n).padStart(2, "0")

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${iso}T00:00:00Z`))

/**
 * The shared layout for the four legal documents: a tinted header, a switcher
 * between the documents, a sticky contents rail, numbered sections and a
 * closing help panel.
 *
 * Renders inside `SiteChrome` (see `app/legal/layout.tsx`), so it inherits the
 * `--eh-*` tokens and the global reveal orchestrator — the `eh-reveal` classes
 * here need no wiring of their own.
 */
export function LegalDocument({ doc, lead, updated, sections }: LegalDocumentProps) {
    const index = LEGAL_DOCS.findIndex((d) => d.key === doc)
    const current = LEGAL_DOCS[index]
    const others = LEGAL_DOCS.filter((d) => d.key !== doc)
    const contents = sections.map(({ id, title }) => ({ id, title }))
    const DocIcon = current.icon

    return (
        <div className="eh-legal">
            <LegalTransitionSettle />
            <LegalProgress />

            <header className="eh-legal-hero">
                <div className="eh-aurora" aria-hidden="true" />
                <div className="eh-legal-texture eh-guilloche" aria-hidden="true" />

                <div className="eh-legal-shell">
                    <nav aria-label="Breadcrumb" className="eh-legal-crumbs eh-reveal">
                        <ol>
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>Legal</li>
                            <li aria-current="page">{current.label}</li>
                        </ol>
                    </nav>

                    <div className="eh-legal-heading">
                        <span className="eh-legal-mark eh-reveal-pop" aria-hidden="true">
                            <DocIcon />
                        </span>
                        <div>
                            <p className="eh-eyebrow eh-reveal">
                                Legal · {pad(index + 1)} of {pad(LEGAL_DOCS.length)}
                            </p>
                            <h1 className="eh-display eh-legal-title">
                                <span className="eh-line-mask">
                                    <span className="eh-line-inner">{current.label}</span>
                                </span>
                            </h1>
                        </div>
                    </div>

                    <p className="eh-legal-lead eh-reveal">{lead}</p>

                    <dl className="eh-legal-meta">
                        <div className="eh-reveal">
                            <dt>Last updated</dt>
                            <dd>
                                <time dateTime={updated}>{formatDate(updated)}</time>
                            </dd>
                        </div>
                        <div className="eh-reveal">
                            <dt>Length</dt>
                            <dd>{sections.length} sections</dd>
                        </div>
                        <div className="eh-reveal">
                            <dt>Questions</dt>
                            <dd>
                                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                            </dd>
                        </div>
                    </dl>
                </div>
            </header>

            <div className="eh-legal-shell">
                <nav className="eh-legal-switch" aria-label="Legal documents">
                    {/* The pill is its own element, placed on the active tab's
                        cell through the column/row variables, so a view
                        transition can slide it between tabs (see transition.ts). */}
                    <div
                        className="eh-legal-switch-track"
                        style={
                            {
                                "--eh-tab-col": index,
                                "--eh-tab-col-sm": index % 2,
                                "--eh-tab-row-sm": Math.floor(index / 2),
                            } as CSSProperties
                        }
                    >
                        <span className="eh-legal-switch-pill" aria-hidden="true" />
                        <ul>
                            {LEGAL_DOCS.map(({ key, label, href, icon: Icon }) => (
                                <li key={key}>
                                    <LegalLink href={href} tab aria-current={key === doc ? "page" : undefined}>
                                        <span
                                            className="eh-legal-switch-label"
                                            style={{ "--eh-vt-name": `eh-legal-tab-${key}` } as CSSProperties}
                                        >
                                            <Icon aria-hidden="true" />
                                            {label}
                                        </span>
                                    </LegalLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </div>

            <div className="eh-legal-shell eh-legal-layout">
                <aside className="eh-legal-aside">
                    <LegalContents items={contents} />
                </aside>

                <article className="eh-legal-article">
                    <details className="eh-legal-toc-mobile">
                        <summary>
                            <span>
                                On this page
                                <span className="eh-legal-toc-count">{sections.length} sections</span>
                            </span>
                            <ChevronDown aria-hidden="true" />
                        </summary>
                        <ol>
                            {sections.map((s, i) => (
                                <li key={s.id}>
                                    <a href={`#${s.id}`}>
                                        <span className="eh-legal-contents-num" aria-hidden="true">
                                            {pad(i + 1)}
                                        </span>
                                        {s.title}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </details>

                    {sections.map((s, i) => (
                        <section
                            key={s.id}
                            id={s.id}
                            aria-labelledby={`${s.id}-title`}
                            className="eh-legal-section eh-reveal"
                        >
                            <span className="eh-legal-num" aria-hidden="true">
                                {pad(i + 1)}
                            </span>
                            <div className="eh-legal-section-head">
                                <h2 id={`${s.id}-title`} className="eh-display">
                                    {s.title}
                                </h2>
                                <a className="eh-legal-anchor" href={`#${s.id}`} aria-label={`Link to “${s.title}”`}>
                                    <Link2 aria-hidden="true" />
                                </a>
                            </div>
                            <div className="eh-legal-prose">{s.body}</div>
                        </section>
                    ))}
                </article>
            </div>

            <div className="eh-legal-shell eh-legal-end">
                <div className="eh-legal-help eh-reveal">
                    <div className="eh-legal-texture eh-guilloche" aria-hidden="true" />
                    <div className="eh-legal-help-copy">
                        <p className="eh-eyebrow">Need a hand?</p>
                        <h2 className="eh-display">Questions about our {current.label}?</h2>
                        <p>
                            If anything in this document is unclear, write to our support team and
                            we&rsquo;ll help you make sense of it.
                        </p>
                        <div className="eh-legal-help-actions">
                            <a className="eh-btn eh-btn-primary" href={`mailto:${SUPPORT_EMAIL}`}>
                                Email support
                            </a>
                            <Link className="eh-btn eh-btn-secondary" href={ROUTES.contact}>
                                Contact page
                            </Link>
                        </div>
                    </div>

                    <nav className="eh-legal-others" aria-label="Other legal documents">
                        <p className="eh-eyebrow">Other documents</p>
                        <ul>
                            {others.map(({ key, label, href, icon: Icon }) => (
                                <li key={key}>
                                    <LegalLink href={href}>
                                        <Icon className="eh-legal-others-icon" aria-hidden="true" />
                                        <span>{label}</span>
                                        <ArrowRight className="eh-legal-others-arrow" aria-hidden="true" />
                                    </LegalLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    )
}
