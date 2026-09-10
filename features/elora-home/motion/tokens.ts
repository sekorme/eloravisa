/**
 * Motion tokens — the JS mirror of the `--eh-dur-*` / `--eh-ease-*` custom
 * properties in `../styles/elora-home.css`.
 *
 * Keeping the two in sync by hand is a small cost; reading computed styles at
 * runtime to avoid it would cost a layout flush on every animation setup, which
 * is a much worse trade.
 */

/** Durations in **seconds**, because that is what GSAP takes. */
export const DUR = {
    /** State flips: focus, checkbox, live dot. */
    xs: 0.14,
    /** Hover and small transforms. */
    sm: 0.24,
    /** Card entrance. */
    md: 0.42,
    /** Section reveal. */
    lg: 0.68,
    /** Cinematic move — passport entering frame. */
    xl: 1.1,
    /** Route draw, count-up. */
    xxl: 1.8,
} as const

/**
 * Named easing curves as GSAP `CustomEase`-free cubic-beziers.
 *
 * `entrance` is the house curve. It leaves fast and settles long, which reads
 * as *weight* — a passport that has mass — rather than as a bounce, which
 * would read as playful and undercut the product's seriousness.
 */
export const EASE = {
    entrance: "cubic-bezier(0.22, 1, 0.36, 1)",
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    exit: "cubic-bezier(0.55, 0, 1, 0.45)",
    /** For anything tied to scroll progress: near-linear so it tracks the
     *  scrollbar honestly and never feels like it is lagging the finger. */
    glide: "cubic-bezier(0.33, 0.02, 0, 1)",
} as const

/** Stagger steps, in seconds. */
export const STAGGER = {
    tight: 0.045,
    normal: 0.08,
    loose: 0.14,
} as const

/**
 * Distance tokens for entrance travel, in px. Deliberately small: long travel
 * on a marketing page reads as a slideshow, and costs more to composite on a
 * mid-range phone.
 */
export const TRAVEL = {
    sm: 12,
    md: 24,
    lg: 40,
} as const
