"use client"

import Link from "next/link"
import { useLayoutEffect, type ComponentProps, type MouseEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { settleLegalTransition, startLegalTransition } from "./transition"

type LegalLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
    href: string
    /** Set on the document switcher's tabs, so the active pill slides. */
    tab?: boolean
}

/**
 * A `next/link` that moves between legal documents with a view transition.
 *
 * Still a real `<a>`: cmd/ctrl/shift/middle-click, "copy link" and keyboard
 * activation all behave normally, and only a plain left click is animated.
 */
export function LegalLink({ href, tab = false, onClick, ...props }: LegalLinkProps) {
    const router = useRouter()
    const pathname = usePathname()

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event)
        if (event.defaultPrevented || event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

        event.preventDefault()
        if (href === pathname) return
        startLegalTransition(() => router.push(href), { fromTabs: tab })
    }

    return <Link href={href} onClick={handleClick} {...props} />
}

/** Rendered once per document; releases a pending transition when it mounts. */
export function LegalTransitionSettle() {
    useLayoutEffect(() => {
        settleLegalTransition()
    }, [])
    return null
}
