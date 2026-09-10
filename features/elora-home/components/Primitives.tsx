import type { ReactNode } from "react"
import Image from "next/image"
import { BRAND } from "../data/content"

/**
 * Layout and typographic primitives.
 *
 * All server components — none of these need interactivity, so none of them
 * ships JavaScript. Scenes compose these rather than repeating utility strings,
 * which is what keeps the vertical rhythm consistent across fourteen sections.
 */

/* -------------------------------------------------------------------------- */
/*  Scene shell                                                               */
/* -------------------------------------------------------------------------- */

interface SceneProps {
    id: string
    children: ReactNode
    /** Adds the passport-guilloché texture behind the scene. */
    texture?: boolean
    className?: string
    /** Accessible name for the section landmark. */
    label?: string
}

export function Scene({ id, children, texture = false, className = "", label }: SceneProps) {
    return (
        <section
            id={id}
            aria-label={label}
            className={`eh-scene ${texture ? "eh-guilloche" : ""} ${className}`}
        >
            {children}
        </section>
    )
}

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <div className={`eh-shell ${className}`}>{children}</div>
}

/* -------------------------------------------------------------------------- */
/*  Typography                                                                */
/* -------------------------------------------------------------------------- */

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <p className={`eh-eyebrow eh-reveal ${className}`}>{children}</p>
}

/** Departure-board lettering — gate numbers, coordinates, timestamps. */
export function Board({ children, className = "" }: { children: ReactNode; className?: string }) {
    return <span className={`eh-board ${className}`}>{children}</span>
}

interface HeadingProps {
    /** Each entry becomes one masked line that rises independently. */
    lines: readonly string[]
    /** Substring rendered with the gradient. Must occur in one of `lines`. */
    accent?: string
    as?: "h1" | "h2" | "h3"
    size?: "xl" | "lg" | "md"
    className?: string
    /** Marks the inner spans for the GSAP line-reveal timeline. */
    revealLines?: boolean
}

const HEADING_SIZE: Record<NonNullable<HeadingProps["size"]>, string> = {
    xl: "var(--eh-text-5xl)",
    lg: "var(--eh-text-4xl)",
    md: "var(--eh-text-3xl)",
}

/**
 * Display heading with per-line masked reveal.
 *
 * Line breaks come from the `lines` array rather than from where the browser
 * happens to wrap, because on a cinematic headline the break *is* the
 * typography. Each line sits in an `overflow: hidden` wrapper so it rises out
 * of a hard edge — a typographic reveal rather than a generic fade.
 *
 * Accessibility note: the whole heading is one element with the full text, so
 * a screen reader reads a single continuous sentence, not four fragments.
 */
export function Heading({
    lines,
    accent,
    as: Tag = "h2",
    size = "lg",
    className = "",
    revealLines = true,
}: HeadingProps) {
    return (
        <Tag
            className={`eh-display ${className}`}
            style={{ fontSize: HEADING_SIZE[size] }}
        >
            {lines.map((line, i) => (
                <span className="eh-line-mask" key={i}>
                    <span className={revealLines ? "eh-line-inner" : undefined}>
                        {accent && line.includes(accent) ? (
                            <>
                                {line.slice(0, line.indexOf(accent))}
                                <span className="eh-grad">{accent}</span>
                                {line.slice(line.indexOf(accent) + accent.length)}
                            </>
                        ) : (
                            line
                        )}
                    </span>
                </span>
            ))}
        </Tag>
    )
}

export function Body({
    children,
    className = "",
    reveal = true,
}: {
    children: ReactNode
    className?: string
    reveal?: boolean
}) {
    return <p className={`eh-body ${reveal ? "eh-reveal" : ""} ${className}`}>{children}</p>
}

/**
 * A short, visible caveat — sample-data notices, AI limitations, "not legal
 * advice". Rendered at readable contrast, never as grey micro-text, because
 * these are the statements that keep the page honest.
 */
export function Caveat({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <p
            className={`eh-reveal ${className}`}
            style={{
                fontSize: "var(--eh-text-sm)",
                lineHeight: 1.6,
                color: "var(--eh-fg-muted)",
                maxWidth: "58ch",
            }}
        >
            {children}
        </p>
    )
}

export function Rule({ className = "" }: { className?: string }) {
    return <hr className={`eh-rule ${className}`} />
}

/* -------------------------------------------------------------------------- */
/*  Section header                                                            */
/* -------------------------------------------------------------------------- */

export function SceneHeader({
    eyebrow,
    lines,
    accent,
    body,
    as = "h2",
    size = "lg",
    align = "start",
}: {
    eyebrow: string
    lines: readonly string[]
    accent?: string
    body?: string
    as?: "h1" | "h2"
    size?: "xl" | "lg" | "md"
    align?: "start" | "center"
}) {
    return (
        <header
            className={align === "center" ? "mx-auto text-center" : ""}
            style={{ maxWidth: align === "center" ? "48rem" : undefined }}
        >
            <Eyebrow>{eyebrow}</Eyebrow>
            <div className="mt-4">
                <Heading lines={lines} accent={accent} as={as} size={size} />
            </div>
            {body ? (
                <Body className={`mt-6 ${align === "center" ? "mx-auto" : ""}`}>{body}</Body>
            ) : null}
        </header>
    )
}

/* -------------------------------------------------------------------------- */
/*  Brand                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The Elora mark.
 *
 * The source PNG is artwork on a white field, so on the midnight-navy page it
 * is set in a light "chip" rather than floated directly on the background —
 * which reads as an intentional brand lockup instead of an untrimmed asset.
 * The wordmark is set in live text beside it, so it stays crisp at any size and
 * remains selectable and translatable.
 */
export function BrandLogo({ size = 34 }: { size?: number }) {
    return (
        <span className="inline-flex items-center gap-2.5">
            <span
                className="grid place-items-center overflow-hidden shrink-0"
                style={{
                    width: size,
                    height: size,
                    borderRadius: "10px",
                    background: "var(--eh-paper-50)",
                    boxShadow: "0 0 0 1px rgb(255 255 255 / 0.14), 0 2px 10px rgb(2 5 14 / 0.5)",
                }}
            >
                <Image
                    src={BRAND.logoSrc}
                    alt=""
                    width={size}
                    height={size}
                    priority
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </span>
            <span
                style={{
                    fontFamily: "var(--eh-font-display)",
                    fontSize: "1.0625rem",
                    letterSpacing: "-0.01em",
                    color: "var(--eh-fg)",
                    whiteSpace: "nowrap",
                }}
            >
                {BRAND.name}
            </span>
        </span>
    )
}
