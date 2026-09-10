/**
 * Proof adapter — verified metrics, testimonials and live classes.
 *
 * ------------------------------------------------------------------------
 * THE RULE THIS FILE EXISTS TO ENFORCE
 * ------------------------------------------------------------------------
 * Elora is a visa *preparation* product. Inventing an approval rate, a star
 * rating, a user count or a named applicant is not a design shortcut — it is a
 * false claim to someone making an expensive, stressful, life-altering
 * decision. So every number and every human voice on the homepage must come
 * from a real source, and where a real source does not exist yet, the scene
 * renders nothing in production.
 *
 * Each function below returns `null` / `[]` rather than a plausible-looking
 * default. The scenes are written to handle that as a first-class state.
 */

import { getPublicStats } from "@/lib/publicStats"
import type { Testimonial } from "../types"

/* ------------------------------------------------------------------------ */
/*  Verified metrics                                                        */
/* ------------------------------------------------------------------------ */

export interface VerifiedMetric {
    /** Stable id, used as a React key and as an analytics label. */
    id: string
    value: number
    label: string
    /** What the number literally counts, so it can't be read as a success rate. */
    caption: string
}

/**
 * Below this count a metric is omitted entirely rather than displayed.
 *
 * This is a *display* decision, never a data one — the number shown is always
 * the real number, and nothing is ever rounded up, padded or invented. It
 * exists because "3 documents reviewed" reads as a broken counter rather than
 * as evidence, and a weak true number is worse than no number at all.
 *
 * Set it to 0 to show every metric regardless. Never replace it with a floor
 * that *substitutes* a larger figure — that would be fabrication.
 */
const MIN_DISPLAYABLE = 25

/** A metric is shown only if it was counted successfully AND is meaningful. */
function isDisplayable(n: number | undefined): n is number {
    return typeof n === "number" && n >= MIN_DISPLAYABLE
}

/**
 * Reads aggregate Firestore counts. `getPublicStats` already returns `undefined`
 * for any metric it could not count safely, and we drop those rather than
 * rendering a zero — "0 document reviews" because an index is missing is a lie
 * of a different kind.
 *
 * Note these are *activity* counts, never outcomes. There is deliberately no
 * "approval rate" here and there must never be one: Elora does not decide
 * applications and cannot observe their results.
 */
export async function getVerifiedMetrics(): Promise<VerifiedMetric[]> {
    let stats: Awaited<ReturnType<typeof getPublicStats>>

    try {
        stats = await getPublicStats()
    } catch {
        // Firestore unreachable at build/request time. Render the scene without
        // metrics rather than failing the page.
        return []
    }

    const metrics: VerifiedMetric[] = []

    if (isDisplayable(stats.registeredApplicants)) {
        metrics.push({
            id: "applicants",
            value: stats.registeredApplicants,
            label: "applicants preparing",
            caption: "People who have created an Elora workspace.",
        })
    }

    if (isDisplayable(stats.documentReviews)) {
        metrics.push({
            id: "reviews",
            value: stats.documentReviews,
            label: "documents reviewed",
            caption: "Documents run through AI review on the platform.",
        })
    }

    if (isDisplayable(stats.mockInterviews)) {
        metrics.push({
            id: "interviews",
            value: stats.mockInterviews,
            label: "mock interviews held",
            caption: "Practice interview sessions completed by applicants.",
        })
    }

    return metrics
}

/* ------------------------------------------------------------------------ */
/*  Testimonials                                                            */
/* ------------------------------------------------------------------------ */

/**
 * There is no verified testimonial source in this project yet — no Firestore
 * collection, no reviewed submission flow, no signed consent record. So this
 * returns an empty array, and `VoicesScene` renders a clearly-labelled
 * development placeholder that is **omitted entirely in production builds**.
 *
 * TO ENABLE REAL TESTIMONIALS
 *   1. Create a `testimonials` collection whose documents carry, at minimum:
 *      quote, name, destination, visaCategory, feature, consentedAt.
 *   2. Only read documents with a `consentedAt` timestamp and a `published`
 *      flag set by a human reviewer — never auto-publish user text.
 *   3. Replace the body of this function with that query.
 *   4. Portraits must be licensed images of the actual person, with alt text
 *      describing them. Do not substitute stock photography for a real named
 *      applicant; attributing a stock face to a named quote is fabrication.
 */
export async function getTestimonials(): Promise<Testimonial[]> {
    return []
}

/* ------------------------------------------------------------------------ */
/*  Live classes                                                            */
/* ------------------------------------------------------------------------ */

export interface LiveClass {
    id: string
    topic: string
    instructor: string
    /** ISO 8601 with offset. */
    startsAt: string
    timezone: string
    seatsRemaining: number | null
    isLive: boolean
}

/**
 * Live classes have no scheduling backend. `action/emailLists.ts` documents
 * this explicitly: `joinClassWaitlist` exists precisely because there are no
 * dates, instructors or seat counts to advertise.
 *
 * So this returns an empty array and the classes scene renders its waitlist
 * form instead of a schedule. It must not render a "Thursday 19:00 GMT · 12
 * seats left" card, because both halves of that sentence would be invented.
 *
 * TO ENABLE A REAL SCHEDULE
 *   Query the collection that backs the class scheduler and return upcoming
 *   sessions. `LiveClassesScene` switches to its schedule layout automatically
 *   as soon as this returns a non-empty array; `seatsRemaining: null` renders
 *   without any availability claim.
 */
export async function getUpcomingClasses(): Promise<LiveClass[]> {
    return []
}
