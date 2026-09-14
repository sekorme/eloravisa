import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { AlertTriangle, Info, Mail } from "lucide-react"
import { SUPPORT_EMAIL } from "./registry"

/**
 * Content blocks for the legal documents. Server components; none ships
 * JavaScript. Every colour comes from the `--eh-*` tokens in `legal.css`.
 *
 * Rows, cards and list items carry `eh-reveal` individually, so the global
 * RevealOrchestrator staggers them in as a group when they scroll into view.
 */

/**
 * A highlighted statement. `important` is for the clauses a visitor must not
 * miss (no guarantee of approval, not legal advice). The tone is always
 * printed as a text label too, so it never relies on colour alone.
 */
export function Callout({
    tone = "note",
    label,
    children,
}: {
    tone?: "note" | "important"
    label?: string
    children: ReactNode
}) {
    const Icon = tone === "important" ? AlertTriangle : Info
    return (
        <div className="eh-legal-callout eh-reveal" data-tone={tone}>
            <Icon className="eh-legal-callout-icon" aria-hidden="true" />
            <div>
                <p className="eh-legal-callout-label">{label ?? (tone === "important" ? "Important" : "Note")}</p>
                <div className="eh-legal-callout-body">{children}</div>
            </div>
        </div>
    )
}

/** Term / explanation pairs, e.g. the categories of data collected. */
export function Definitions({ items }: { items: readonly { term: string; detail: ReactNode }[] }) {
    return (
        <dl className="eh-legal-defs">
            {items.map((item) => (
                <div key={item.term} className="eh-reveal">
                    <dt>{item.term}</dt>
                    <dd>{item.detail}</dd>
                </div>
            ))}
        </dl>
    )
}

/** A grid of small titled cards, e.g. purposes of use or cookie types. */
export function TermGrid({
    items,
    columns = 2,
}: {
    items: readonly { title: string; body: ReactNode; icon: LucideIcon }[]
    columns?: 2 | 3
}) {
    return (
        <ul className="eh-legal-terms" data-columns={columns}>
            {items.map(({ title, body, icon: Icon }) => (
                <li key={title} className="eh-reveal">
                    <span className="eh-legal-terms-icon" aria-hidden="true">
                        <Icon />
                    </span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                </li>
            ))}
        </ul>
    )
}

export function Bullets({ items }: { items: readonly ReactNode[] }) {
    return (
        <ul className="eh-legal-list">
            {items.map((item, i) => (
                <li key={i} className="eh-reveal">
                    {item}
                </li>
            ))}
        </ul>
    )
}

export function EmailLink() {
    return (
        <a className="eh-legal-email" href={`mailto:${SUPPORT_EMAIL}`}>
            <Mail aria-hidden="true" />
            {SUPPORT_EMAIL}
        </a>
    )
}
