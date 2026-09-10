import type { RoadmapStage } from "../types"

/**
 * The example roadmap rendered in Scene 5.
 *
 * `exampleState` drives the emerald/amber/dim treatment. It is labelled as an
 * example in the scene itself — a visitor must never read this as their own
 * progress, and must never read the mix of states as a typical outcome.
 */
export const ROADMAP_STAGES: RoadmapStage[] = [
    {
        id: "profile",
        label: "Profile completion",
        detail: "Destination, visa route, timeline and travel purpose.",
        icon: "passport",
        exampleState: "done",
    },
    {
        id: "collection",
        label: "Document collection",
        detail: "Gather everything your route asks for, tracked in one checklist.",
        icon: "checklist",
        exampleState: "done",
    },
    {
        id: "review",
        label: "Document review",
        detail: "AI reads your file as a whole and reports what it found.",
        icon: "scan",
        exampleState: "done",
    },
    {
        id: "sop",
        label: "Statement of purpose",
        detail: "Draft, refine and check it against the rest of your application.",
        icon: "sop",
        exampleState: "active",
    },
    {
        id: "interview",
        label: "Mock interview",
        detail: "Practise aloud, then review structure and clarity.",
        icon: "interview",
        exampleState: "upcoming",
    },
    {
        id: "readiness",
        label: "Final readiness review",
        detail: "One last pass over the gaps that still matter.",
        icon: "readiness",
        exampleState: "upcoming",
    },
    {
        id: "submission",
        label: "Submission preparation",
        detail: "Assemble the final portfolio in the order you'll present it.",
        icon: "calendar",
        exampleState: "upcoming",
    },
]
