/**
 * Thin, typed wrapper over the gtag snippet loaded in `app/layout.tsx`.
 *
 * Why this exists instead of calling `gtag(...)` inline:
 *  - the event name is a closed union, so a typo fails the build rather than
 *    silently creating a junk event in Google Analytics;
 *  - every call site goes through one place that strips anything sensitive;
 *  - it no-ops safely during SSR and when the snippet is blocked, so analytics
 *    can never break a CTA.
 *
 * PRIVACY: never pass visa answers, document contents, filenames, passport or
 * financial details, email addresses or free-text the applicant typed. The
 * `EventParams` type only permits coarse, non-identifying fields on purpose —
 * widen it with care.
 */

export type AnalyticsEvent =
  /** §26 Hero primary CTA click. */
  | "hero_cta_primary_click"
  /** §26 Hero mock interview click. */
  | "hero_mock_interview_click"
  /** §26 Tool card interaction (bento grid). */
  | "tool_card_interaction"
  /** §26 Pricing plan selection. */
  | "pricing_plan_select"
  /** §26 Live class reservation / waitlist join. */
  | "live_class_reservation"
  /** §26 FAQ engagement (an answer was opened). */
  | "faq_engagement"
  /** §26 Account creation started (signup sheet opened / submitted). */
  | "account_creation_started"
  /** §26 Account creation completed (account actually exists). */
  | "account_creation_completed"
  /** Secondary: a section's CTA that isn't one of the above. */
  | "section_cta_click"

/**
 * Coarse, non-identifying context only. `label` should be a stable slug you
 * control (a tool id, a plan name, a section id) — never user input.
 */
export type EventParams = {
  label?: string
  /** Where on the page the interaction happened, e.g. "hero", "pricing". */
  location?: string
  /** Numeric value where one is meaningful (e.g. a plan price). */
  value?: number
}

type GtagFn = (command: string, ...args: unknown[]) => void

function gtag(): GtagFn | null {
  if (typeof window === "undefined") return null
  const fn = (window as unknown as { gtag?: GtagFn }).gtag
  return typeof fn === "function" ? fn : null
}

/** Records a product event. Safe to call from anywhere, including SSR. */
export function trackEvent(event: AnalyticsEvent, params: EventParams = {}): void {
  const send = gtag()
  if (!send) return
  try {
    send("event", event, {
      event_label: params.label,
      event_location: params.location,
      value: params.value,
    })
  } catch {
    // Analytics must never surface an error to the applicant.
  }
}

/**
 * Reports a Google Ads conversion. Call this only when the conversion has
 * genuinely happened — i.e. an account now exists.
 *
 * This used to fire unconditionally on every page load from the inline snippet
 * in `app/layout.tsx`, which reported every visitor as a conversion. Keep it
 * behind a real completion event.
 */
export function trackSignupConversion(): void {
  const send = gtag()
  if (!send) return
  try {
    send("event", "conversion", {
      send_to: "AW-17910098280/4eIACJTZ8-0bEOjSmdxC",
      value: 1.0,
      currency: "USD",
    })
  } catch {
    // ignore
  }
}
