/**
 * Shared types for the Elora Home feature.
 *
 * These describe *content shapes*, deliberately serialisable, so every data
 * module in `../data` could later be swapped for a CMS fetch without touching
 * a single scene component.
 */

export type IconName =
    | "passport"
    | "checklist"
    | "sop"
    | "interview"
    | "readiness"
    | "classes"
    | "shield"
    | "route"
    | "scan"
    | "calendar"

/** A stage in the pinned "anxiety → clear next step" narrative (Scene 2). */
export interface JourneyStage {
    id: string
    /** Two-digit departure-board index, e.g. "01". */
    index: string
    title: string
    body: string
    /** Short label for the vertical progress rail. */
    railLabel: string
}

/** A document surfaced in the document-intelligence scene (Scene 3). */
export interface DocumentSpec {
    id: string
    /** Title as it appears on the rendered paper. */
    title: string
    /** Monospace sub-line — issuing body, reference, etc. All fictional//generic. */
    meta: string
    /** Lines of text rendered as redacted rules on the paper. */
    lines: number
    /** Where Elora flags something. `null` means the document reads clean. */
    finding: DocumentFinding | null
    tone: "paper" | "navy"
}

export interface DocumentFinding {
    /** `gap` = something missing, `conflict` = two documents disagree. */
    kind: "gap" | "conflict" | "evidence"
    label: string
    detail: string
}

/** A state in the live mock-interview machine (Scene 4). */
export type InterviewState = "connecting" | "listening" | "thinking" | "speaking"

export interface InterviewQuestion {
    id: string
    category: string
    prompt: string
    /** What a well-structured answer covers. Coaching, never a script to recite. */
    coaching: string[]
}

/** A stage on the personalised roadmap (Scene 5). */
export interface RoadmapStage {
    id: string
    label: string
    detail: string
    icon: IconName
    /** Drives the emerald "verified" treatment in the example state. */
    exampleState: "done" | "active" | "upcoming"
}

/** A destination in the global guidance scene (Scene 6). */
export interface Destination {
    id: string
    name: string
    /** ISO 3166-1 alpha-2, used for the marker label and flag emoji. */
    code: string
    /** Normalised globe coordinates in degrees. */
    lat: number
    lon: number
    /** Visa categories Elora has preparation material for. */
    categories: string[]
    /** Preparation areas — never processing times or legal claims. */
    preparation: string[]
    /** How much interview practice typically matters for this route. */
    interviewRelevance: "High" | "Moderate" | "Varies by route"
    documents: string[]
}

/** A tool in the ecosystem constellation (Scene 8). */
export interface EcosystemTool {
    id: string
    name: string
    benefit: string
    icon: IconName
    /** ids of tools this one feeds information to. Drives the constellation edges. */
    feeds: string[]
    /** Position on the constellation, in percent of the canvas box. */
    x: number
    y: number
    href: string
}

/** A pricing plan, projected from lib/subscriptions.ts by the pricing adapter. */
export interface PricingPlan {
    id: string
    name: string
    /** List price in USD, as configured in SUBSCRIPTION_PLANS. */
    priceUsd: number
    tokens: number
    /** Who this plan suits. */
    audience: string
    features: string[]
    recommended: boolean
    /** Only set on paid plans that step up from a cheaper one. */
    upgradeFrom?: string
}

/** A verified testimonial. Never constructed from invented data — see
 *  `../adapters/testimonials.ts` for the contract. */
export interface Testimonial {
    id: string
    quote: string
    name: string
    destination: string
    visaCategory: string
    /** Which Elora feature the applicant credited. */
    feature: string
    /** Optional portrait; must be a real, licensed image. */
    portrait?: { src: string; alt: string }
}

export interface FooterColumn {
    heading: string
    links: { label: string; href: string; external?: boolean }[]
}
