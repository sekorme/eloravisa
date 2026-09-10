import type { StoryImage } from "./media"

/**
 * "Who is this for" — the four applicant situations.
 *
 * ------------------------------------------------------------------------
 * EDITS MADE TO THE SUPPLIED COPY, AND WHY
 * ------------------------------------------------------------------------
 * The wording is the client's, kept almost verbatim. Three phrases were changed
 * because they promised things this product cannot deliver — the same rule the
 * rest of `data/content.ts` is written under:
 *
 *  1. "a clear roadmap from your initial idea to your final approval"
 *     → "...to the day you submit". Elora's roadmap ends at submission. Approval
 *       is the embassy's decision and is not ours to put at the end of a
 *       sentence about what we provide.
 *
 *  2. "Turning setbacks into success."
 *     → "Turning a setback into a stronger application." Same sentiment, but it
 *       promises the work, not the outcome.
 *
 *  3. "We specialize in analyzing refusal letters to identify exactly what went
 *     wrong."
 *     → rewritten. There is no refusal-letter analyser in this product. What
 *       genuinely exists is document review that checks the areas refusals
 *       commonly turn on, and a checklist item for declaring a previous refusal
 *       correctly (see `components/review/AIReviewResults.tsx` and
 *       `components/application/EmbassyTips.tsx`). "Identify exactly what went
 *       wrong" also overstates what a refusal letter usually tells you — most
 *       give general grounds, not a specific fault.
 *
 * If you want the original wording back, it is quoted above; change it here and
 * nowhere else.
 */

export interface Audience {
    id: string
    /** Two-digit departure-board index. */
    index: string
    /** The label, e.g. "First-time Applicants". */
    title: string
    /** The one-line promise. */
    tagline: string
    body: string
    image: StoryImage
}

export const AUDIENCES: Audience[] = [
    {
        id: "first-time",
        index: "01",
        title: "First-time Applicants",
        tagline: "A smooth start to your new chapter.",
        body:
            "The visa application process can be daunting, but it doesn't have to be. We simplify the complexities, providing a clear roadmap from your initial idea to the day you submit. Our step-by-step guidance helps make sure you never miss a detail.",
        image: {
            src: "/firsttime.png",
            alt: "A man sitting at a desk reading a printed guide for first-time visa applicants, with a passport and a document envelope in front of him.",
            width: 1254,
            height: 1254,
        },
    },
    {
        id: "past-refusals",
        index: "02",
        title: "Past Refusals",
        tagline: "Turning a setback into a stronger application.",
        body:
            "A previous refusal isn't the end of the road. Elora helps you read your application back against the areas refusals most often turn on — evidence gaps, inconsistent dates, weakly supported intentions — and makes sure a previous refusal is declared properly. You reapply with a file you understand.",
        image: {
            src: "/pastrefusal.png",
            alt: "A woman looking distressed as she reads a visa application form stamped REJECTED in red.",
            width: 1254,
            height: 1254,
        },
    },
    {
        id: "students-workers",
        index: "03",
        title: "Students & Workers",
        tagline: "Bridging the gap to global opportunities.",
        body:
            "Whether you're pursuing a degree or a career abroad, we provide specialised support for study permits and work visas. Our guidance is tailored to your route, helping you navigate institutional requirements and prepare the evidence those applications ask for.",
        image: {
            src: "/studentworker.png",
            alt: "A woman and a man sitting together at an office desk, going through printed documents with a laptop and a notebook open in front of them.",
            width: 1254,
            height: 1254,
        },
    },
    {
        id: "tired-of-agents",
        index: "04",
        title: "Tired of Agents",
        tagline: "Take full control of your journey.",
        body:
            "Say goodbye to middlemen and hidden fees. We give you the knowledge and the tools to handle your own application, so you can avoid misinformation and stay in the driver's seat — with pricing you can see before you pay.",
        image: {
            src: "/tiredofagent.png",
            alt: "A woman gesturing in frustration across a desk towards a man seated behind a nameplate reading Visa Consultant, in an office with a visa services poster on the wall.",
            width: 1448,
            height: 1086,
        },
    },
]
