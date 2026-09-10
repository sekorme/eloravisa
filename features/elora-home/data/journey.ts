import type { JourneyStage } from "../types"

/**
 * The four stages of the pinned transformation scene.
 *
 * These are written as one continuous argument, not four feature blurbs: each
 * stage has to make the next one feel inevitable. Stage 1 is the applicant's
 * input, stage 4 is the applicant's confidence, and 2–3 are the work Elora does
 * in between.
 */
export const JOURNEY_STAGES: JourneyStage[] = [
    {
        id: "plan",
        index: "01",
        railLabel: "Your plan",
        title: "Tell Elora your plan",
        body:
            "Destination, visa type, purpose of travel and the date you're working towards. Four answers — that's the whole setup, and everything after this is shaped by them.",
    },
    {
        id: "requirements",
        index: "02",
        railLabel: "Requirements",
        title: "Understand the requirements",
        body:
            "The scattered advice you've collected from forums, group chats and half-remembered conversations resolves into one ordered checklist built for your route.",
    },
    {
        id: "strengthen",
        index: "03",
        railLabel: "Strengthen",
        title: "Strengthen your application",
        body:
            "Elora reads your documents together rather than one at a time — surfacing what's missing, what contradicts something else, and what you've claimed without evidencing.",
    },
    {
        id: "decide",
        index: "04",
        railLabel: "Prepare",
        title: "Prepare for the decision",
        body:
            "Interview practice, a readiness score you can interrogate, and a short list of what still deserves your attention before you submit.",
    },
]
