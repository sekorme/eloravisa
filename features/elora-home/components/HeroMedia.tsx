"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { HERO_IMAGE, HERO_VIDEO, HERO_MEDIA } from "../data/media"
import { useReducedMotion } from "../motion/useMotion"

/**
 * The hero's photographic backdrop.
 *
 * ------------------------------------------------------------------------
 * WHY THE IMAGE IS THE FLOOR AND THE VIDEO IS THE CEILING
 * ------------------------------------------------------------------------
 * The still is a real `next/image` with `priority`, so it is the page's LCP
 * element and is optimised, responsive and AVIF/WebP-encoded. It is always
 * rendered. The video, when enabled, fades in *over* it once it can actually
 * play — so there is never a black rectangle, never a spinner, and never a
 * layout shift, regardless of connection speed or codec support.
 *
 * The video is skipped when:
 *   - `prefers-reduced-motion` is set (autoplaying footage is exactly what that
 *     setting is for),
 *   - the browser reports a saveData preference or a 2G connection.
 *
 * There is deliberately NO viewport-width gate. An earlier version skipped the
 * video below 900px to save mobile data, which meant phones — most of this
 * product's audience — never saw the hero as designed. The connection and
 * saveData checks are the meaningful protection, and they apply at every size;
 * the file is well under a megabyte, and it never blocks the still behind it.
 *
 * ------------------------------------------------------------------------
 * READABILITY IS NOT OPTIONAL
 * ------------------------------------------------------------------------
 * The page is white, and the headline sits on top of this. A photograph behind
 * live text is the most common way marketing pages fail contrast, so the scrim
 * is not decorative: a near-opaque white wash covers the reading column and
 * only releases toward the right, where the composition — not the copy — lives.
 * Never reduce those stops without re-checking the headline against the photo's
 * lightest region.
 */
export function HeroMedia() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [videoReady, setVideoReady] = useState(false)
    const [useVideo, setUseVideo] = useState(false)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (HERO_MEDIA.kind !== "video") return
        if (reduced) return

        // `connection` is advisory and absent in Safari; absence means "assume
        // it's fine" rather than blocking.
        const conn = (
            navigator as Navigator & {
                connection?: { saveData?: boolean; effectiveType?: string }
            }
        ).connection

        if (conn?.saveData) return
        if (conn?.effectiveType && /2g/.test(conn.effectiveType)) return

        setUseVideo(true)
    }, [reduced])

    useEffect(() => {
        const v = videoRef.current
        if (!v || !useVideo) return

        const reveal = () => setVideoReady(true)

        // Three signals, because no single one fires reliably everywhere:
        // `playing` is the correct event but is skipped by some browsers when a
        // muted video starts from cache; `loadeddata` and `canplay` cover those.
        v.addEventListener("playing", reveal)
        v.addEventListener("loadeddata", reveal)
        v.addEventListener("canplay", reveal)

        // `load()` is needed because the element renders with preload="metadata"
        // and may already have settled before this effect attaches.
        if (v.readyState === 0) v.load()

        // Autoplay can still be refused (iOS low-power mode, browser policy).
        // On rejection the still simply stays — never a black rectangle.
        void v.play().catch(() => {
            // Some engines reject the first call but succeed once data arrives.
            const retry = () => void v.play().catch(() => undefined)
            v.addEventListener("canplay", retry, { once: true })
        })

        // Already buffered before the listeners attached.
        if (v.readyState >= 2) reveal()

        return () => {
            v.removeEventListener("playing", reveal)
            v.removeEventListener("loadeddata", reveal)
            v.removeEventListener("canplay", reveal)
        }
    }, [useVideo])

    return (
        <div className="eh-hero-media" aria-hidden="true">
            <Image
                src={HERO_IMAGE.src}
                alt=""
                fill
                // The LCP element. `priority` is what makes next/image emit
                // `fetchpriority="high"`, drop lazy loading, and inject a
                // `<link rel="preload" as="image">` into the document head.
                // Do not also pass `fetchPriority` by hand — that prop is
                // forwarded to the underlying <img> and suppresses the
                // preload that `priority` would otherwise generate.
                priority
                sizes="100vw"
                className="eh-hero-media-img"
            />

            {useVideo ? (
                <video
                    ref={videoRef}
                    className="eh-hero-media-video"
                    data-ready={videoReady ? "true" : "false"}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    // Poster is the same still, so the swap is invisible.
                    poster={HERO_IMAGE.src}
                >
                    <source src={HERO_VIDEO.src} type={HERO_VIDEO.type} />
                </video>
            ) : null}

            {/* Scrims. Two layers: a horizontal wash that protects the reading
                column, and a vertical one that keeps the navigation legible at
                the top and lets the scene settle into white at the bottom. */}
            <span className="eh-hero-scrim-x" />
            <span className="eh-hero-scrim-y" />
        </div>
    )
}
