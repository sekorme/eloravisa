import type { DocumentSpec } from "../types"

/**
 * The document set rendered in Scene 3.
 *
 * ------------------------------------------------------------------------
 * WHY THESE ARE DRAWN, NOT PHOTOGRAPHED
 * ------------------------------------------------------------------------
 * Every "document" in this scene is CSS/SVG built from generic shapes and
 * redacted text rules. That is a deliberate safety decision, not a shortcut:
 *
 *   - No government seal, coat of arms or crest appears anywhere, because
 *     reproducing one is a licensing and authenticity problem.
 *   - No visa sticker or vignette is depicted, because a realistic one could be
 *     screenshotted and passed off as genuine.
 *   - Body text renders as blurred rules rather than legible words, so nothing
 *     here can be mistaken for a real person's financial or passport data.
 *
 * `meta` strings are obviously generic (`REF ****`), never plausible real
 * reference numbers.
 */
export const DOCUMENT_SPECS: DocumentSpec[] = [
    {
        id: "passport",
        title: "Passport",
        meta: "TRAVEL DOCUMENT · REF ****",
        lines: 5,
        tone: "navy",
        finding: null,
    },
    {
        id: "bank",
        title: "Bank statement",
        meta: "6 MONTHS · REF ****",
        lines: 8,
        tone: "paper",
        finding: {
            kind: "conflict",
            label: "Dates disagree",
            detail:
                "The statement period ends two months before your intended travel date. Most routes expect recent evidence.",
        },
    },
    {
        id: "employment",
        title: "Employment letter",
        meta: "EMPLOYER LETTER · REF ****",
        lines: 6,
        tone: "paper",
        finding: {
            kind: "evidence",
            label: "Claim not evidenced",
            detail:
                "Your leave dates are stated but not confirmed. An approved-leave line would carry more weight.",
        },
    },
    {
        id: "admission",
        title: "Admission letter",
        meta: "INSTITUTION · REF ****",
        lines: 7,
        tone: "paper",
        finding: null,
    },
    {
        id: "itinerary",
        title: "Travel itinerary",
        meta: "ITINERARY · REF ****",
        lines: 5,
        tone: "paper",
        finding: {
            kind: "gap",
            label: "Missing",
            detail:
                "No accommodation booking is attached. Your itinerary currently covers flights only.",
        },
    },
    {
        id: "sop",
        title: "Statement of purpose",
        meta: "DRAFT v3 · REF ****",
        lines: 9,
        tone: "paper",
        finding: {
            kind: "evidence",
            label: "Weak section",
            detail:
                "Your reason for returning home is asserted in one line. This is the section interviewers probe most.",
        },
    },
]
