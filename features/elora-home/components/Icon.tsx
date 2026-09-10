import type { SVGProps } from "react"
import type { IconName } from "../types"

/**
 * The homepage icon set.
 *
 * Drawn here rather than pulled from a library so every glyph shares one
 * geometry: a 24×24 grid, 1.5 stroke, round caps and joins, and shapes built
 * from the page's own motifs (passport pages, document edges, readiness rings,
 * flight paths). A mixed icon set is the fastest way to make a premium page
 * look assembled from parts.
 *
 * All icons are `aria-hidden` by default — they sit beside a text label
 * everywhere they are used, so announcing them would only add noise. Pass a
 * `title` to make one meaningful to a screen reader.
 */

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
    name: IconName
    /** Pixel size; the icon is square. */
    size?: number
    /** Providing this makes the icon a labelled `img` for assistive tech. */
    title?: string
}

const PATHS: Record<IconName, React.ReactNode> = {
    /* Passport: a bound booklet with a data-page line and an ID chip. */
    passport: (
        <>
            <path d="M5.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V5a1.5 1.5 0 0 1 1.5-1.5Z" />
            <path d="M7 3.5v17" />
            <circle cx="12.5" cy="9.5" r="2.5" />
            <path d="M10 15h5M10 17.5h3" />
        </>
    ),
    /* Checklist: a document with two ticked rules. */
    checklist: (
        <>
            <path d="M6 3.5h9.5L19 7v13.5H6z" />
            <path d="M15 3.5V7h3.5" />
            <path d="m8.75 11.5 1.25 1.25 2.25-2.25" />
            <path d="m8.75 15.75 1.25 1.25 2.25-2.25" />
            <path d="M14.5 11.75h2.25M14.5 16h2.25" />
        </>
    ),
    /* SOP: a page with a nib stroke across it. */
    sop: (
        <>
            <path d="M6 3.5h8L18 7.5v13H6z" />
            <path d="M14 3.5v4h4" />
            <path d="M9 12.5h6M9 15.5h4" />
            <path d="m16.5 15.5-4 4-2 .5.5-2 4-4z" />
        </>
    ),
    /* Interview: a microphone capsule over a speech baseline. */
    interview: (
        <>
            <rect x="9.25" y="3" width="5.5" height="10" rx="2.75" />
            <path d="M6.5 11a5.5 5.5 0 0 0 11 0" />
            <path d="M12 16.5V21" />
            <path d="M9 21h6" />
        </>
    ),
    /* Readiness: an open progress ring with a centre mark. */
    readiness: (
        <>
            <path d="M12 3.75a8.25 8.25 0 1 1-5.83 2.42" />
            <path d="M12 3.75V8" />
            <circle cx="12" cy="12" r="2.25" />
        </>
    ),
    /* Classes: a broadcast screen with a signal arc. */
    classes: (
        <>
            <rect x="3.5" y="5" width="17" height="11" rx="1.75" />
            <path d="M9.5 20h5M12 16v4" />
            <path d="M9.75 12.25a2.25 2.25 0 0 1 4.5 0" />
            <circle cx="12" cy="9" r="1.25" />
        </>
    ),
    /* Shield: security, with a fold line rather than a tick. */
    shield: (
        <>
            <path d="M12 3.25 5 6v6c0 4 3 7 7 8.75 4-1.75 7-4.75 7-8.75V6z" />
            <path d="M12 3.25v17.5" />
            <path d="M9 11.5h6" />
        </>
    ),
    /* Route: a flight path arc between two markers. */
    route: (
        <>
            <circle cx="5.5" cy="17.5" r="2" />
            <circle cx="18.5" cy="6.5" r="2" />
            <path d="M7.25 16.25C9.5 12 13 8.75 16.75 7.5" strokeDasharray="2.5 2.5" />
        </>
    ),
    /* Scan: a document under a scanning beam. */
    scan: (
        <>
            <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
            <path d="M4 12h16" />
        </>
    ),
    /* Calendar: appointment date with a marked day. */
    calendar: (
        <>
            <rect x="3.75" y="5.5" width="16.5" height="14.75" rx="1.75" />
            <path d="M3.75 10h16.5" />
            <path d="M8 3.5v4M16 3.5v4" />
            <rect x="10.5" y="13" width="3" height="3" rx="0.5" />
        </>
    ),
}

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
    const labelled = Boolean(title)

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            role={labelled ? "img" : undefined}
            aria-hidden={labelled ? undefined : true}
            focusable="false"
            {...rest}
        >
            {labelled ? <title>{title}</title> : null}
            {PATHS[name]}
        </svg>
    )
}

/* -------------------------------------------------------------------------- */
/*  UI affordances — kept separate from the motif set above.                   */
/* -------------------------------------------------------------------------- */

export function ArrowRight({ size = 18, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            <path d="M5 12h13M12.5 5.5 19 12l-6.5 6.5" />
        </svg>
    )
}

export function ArrowDown({ size = 18, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            <path d="M12 5v13M5.5 11.5 12 18l6.5-6.5" />
        </svg>
    )
}

export function Check({ size = 16, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...rest}
        >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
    )
}
