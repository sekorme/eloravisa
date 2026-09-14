"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Printer } from "lucide-react"

/**
 * The sticky "On this page" rail beside a legal document.
 *
 * The links are plain in-page anchors, so they work before hydration. The
 * script adds the current-section state, the print button, and a highlight
 * bar that glides between entries rather than jumping.
 *
 * The active section is the last one whose top has crossed a line 30% down
 * the viewport, with the final section forced active at the bottom of the
 * page — a short closing section can never reach that line on its own.
 *
 * It also stamps `data-active` on the active `<section>`, which lights up its
 * number chip. The rail is `display: none` below 1024px but stays mounted, so
 * that still works on phones.
 */
export function LegalContents({ items }: { items: readonly { id: string; title: string }[] }) {
    const [active, setActive] = useState(items[0]?.id)
    const list = useRef<HTMLOListElement>(null)
    const thumb = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const sections = items
            .map((item) => document.getElementById(item.id))
            .filter((el): el is HTMLElement => el !== null)
        if (sections.length === 0) return

        let frame = 0
        const update = () => {
            frame = 0
            const line = window.innerHeight * 0.3
            const atBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
            let current = sections[0].id
            if (atBottom) {
                current = sections[sections.length - 1].id
            } else {
                for (const section of sections) {
                    if (section.getBoundingClientRect().top <= line) current = section.id
                }
            }
            setActive(current)
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }

        update()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [items])

    // Mark the active section in the article.
    useEffect(() => {
        if (!active) return
        const section = document.getElementById(active)
        section?.setAttribute("data-active", "")
        return () => section?.removeAttribute("data-active")
    }, [active])

    // Move the highlight bar onto the active entry. Layout effect, so the bar
    // is placed before paint and never visibly starts from the top.
    useLayoutEffect(() => {
        const place = () => {
            const link = list.current?.querySelector<HTMLElement>('a[aria-current="location"]')
            if (!link || !thumb.current) return
            thumb.current.style.transform = `translateY(${link.offsetTop}px)`
            thumb.current.style.height = `${link.offsetHeight}px`
        }
        place()
        window.addEventListener("resize", place)
        return () => window.removeEventListener("resize", place)
    }, [active])

    return (
        <nav className="eh-legal-contents" aria-label="On this page">
            <p className="eh-eyebrow">On this page</p>
            {/* The track is the positioned parent, so each link's offsetTop is
                measured from it. */}
            <div className="eh-legal-contents-track">
                <span ref={thumb} className="eh-legal-contents-thumb" aria-hidden="true" />
                <ol ref={list}>
                    {items.map((item, i) => (
                        <li key={item.id}>
                            <a href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined}>
                                <span className="eh-legal-contents-num" aria-hidden="true">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                {item.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
            <button type="button" className="eh-legal-print" onClick={() => window.print()}>
                <Printer aria-hidden="true" />
                Print or save as PDF
            </button>
        </nav>
    )
}
