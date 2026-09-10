/**
 * Route adapter.
 *
 * The homepage never hardcodes a path inline. Every destination goes through
 * this map, so a route rename is a one-line change here rather than a hunt
 * through fourteen scenes — and so it is obvious at a glance that the homepage
 * only ever links at routes that actually exist.
 *
 * Every path below was verified against `app/**\/page.tsx` at build time of
 * this feature. If you add an entry, add the route first.
 */
export const ROUTES = {
    // --- auth -------------------------------------------------------------
    signUp: "/signup",
    signIn: "/login",
    onboarding: "/onboarding",

    // --- product ----------------------------------------------------------
    dashboard: "/dashboard",
    aiTools: "/ai-tools",
    mockInterview: "/dashboard/ai-mock-interview",
    documentReview: "/dashboard/application",
    sopDraft: "/dashboard/draft",
    consular: "/dashboard/consular",
    readiness: "/dashboard/information",
    history: "/dashboard/history",
    subscription: "/dashboard/subscription",

    // --- marketing --------------------------------------------------------
    howItWorks: "/how-it-works",
    pricing: "/pricing",
    resources: "/resources",
    visaGuidance: "/visa-guidance",
    successStories: "/success-stories",
    about: "/about",
    contact: "/contact",
    affiliate: "/affiliate",

    // --- legal ------------------------------------------------------------
    privacy: "/legal/privacy-policy",
    terms: "/legal/terms-of-service",
    cookies: "/legal/cookie-policy",
    disclaimer: "/legal/disclaimer",
} as const

export type RouteKey = keyof typeof ROUTES

/**
 * Destination guides do not have per-country routes yet, so every country
 * marker points at the one guidance page that does exist rather than at a
 * fabricated `/destinations/uk` that would 404.
 */
export function destinationGuideHref(): string {
    return ROUTES.visaGuidance
}
