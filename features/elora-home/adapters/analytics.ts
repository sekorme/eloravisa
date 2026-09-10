/**
 * Provider-independent analytics adapter.
 *
 * Scenes never import `lib/analytics` and never touch `window.gtag`. They call
 * `track(...)` with a homepage-specific event from the union below, and this
 * module decides where it goes. Swapping Google Analytics for Segment, Plausible
 * or PostHog is a change to `dispatch()` alone.
 *
 * Two rules that must survive any refactor:
 *   1. Never pass applicant input. Labels are slugs this codebase controls —
 *      a plan id, a country code, a section id. Never an email, a document
 *      name, a free-text answer, or anything typed by the user.
 *   2. Analytics must never be able to break a CTA. Every path is wrapped and
 *      failures are swallowed.
 */

import { trackEvent, type AnalyticsEvent, type EventParams } from "@/lib/analytics"

/** Homepage-level intents, named for what the applicant did, not for the UI. */
export type HomeEvent =
    | "hero_primary_cta"
    | "hero_secondary_cta"
    | "sample_interview_started"
    | "destination_selected"
    | "destination_guide_opened"
    | "live_class_waitlist_joined"
    | "pricing_plan_selected"
    | "final_cta"
    | "sign_in"
    | "tool_focused"
    | "nav_cta"

export interface HomeEventContext {
    /** Stable slug under our control. Never user input. */
    label?: string
    /** Scene the interaction happened in, e.g. "hero", "pricing". */
    scene?: string
    /** A meaningful number, e.g. a plan's USD price. */
    value?: number
}

/**
 * Maps a homepage intent onto the closed union the underlying provider wrapper
 * accepts. Where there is no exact counterpart we fall back to the generic
 * section-CTA event rather than inventing a new one, keeping the provider's
 * event vocabulary stable.
 */
const PROVIDER_EVENT: Record<HomeEvent, AnalyticsEvent> = {
    hero_primary_cta: "hero_cta_primary_click",
    hero_secondary_cta: "section_cta_click",
    sample_interview_started: "hero_mock_interview_click",
    destination_selected: "section_cta_click",
    destination_guide_opened: "section_cta_click",
    live_class_waitlist_joined: "live_class_reservation",
    pricing_plan_selected: "pricing_plan_select",
    final_cta: "section_cta_click",
    sign_in: "account_creation_started",
    tool_focused: "tool_card_interaction",
    nav_cta: "section_cta_click",
}

function dispatch(event: HomeEvent, ctx: HomeEventContext): void {
    const params: EventParams = {
        // Prefix keeps homepage events distinguishable from the same provider
        // event fired by other surfaces.
        label: ctx.label ? `home:${ctx.label}` : `home:${event}`,
        location: ctx.scene,
        value: ctx.value,
    }
    trackEvent(PROVIDER_EVENT[event], params)
}

/** Records a homepage interaction. Safe during SSR and when analytics is blocked. */
export function track(event: HomeEvent, ctx: HomeEventContext = {}): void {
    if (typeof window === "undefined") return
    try {
        dispatch(event, ctx)
    } catch {
        // A analytics failure must never surface to the applicant.
    }
}
