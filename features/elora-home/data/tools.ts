import type { EcosystemTool } from "../types"
import { ROUTES } from "../adapters/routes"

/**
 * The tool constellation in Scene 8.
 *
 * `x`/`y` are percentages of the constellation canvas. `feeds` describes which
 * tools consume this tool's output, and the scene draws a real edge for each —
 * so the diagram is generated from the relationships rather than decorated with
 * arbitrary lines. Readiness is the sink: everything eventually feeds it, which
 * is the point the scene is making.
 */
export const ECOSYSTEM_TOOLS: EcosystemTool[] = [
    {
        id: "checklist",
        name: "Smart Checklist",
        benefit: "Turns your route into an ordered list of what to gather, in priority order.",
        icon: "checklist",
        feeds: ["review", "readiness"],
        x: 18,
        y: 22,
        href: ROUTES.readiness,
    },
    {
        id: "review",
        name: "Document Review",
        benefit: "Reads your documents together and reports gaps, conflicts and weak evidence.",
        icon: "scan",
        feeds: ["sop", "readiness"],
        x: 50,
        y: 12,
        href: ROUTES.documentReview,
    },
    {
        id: "sop",
        name: "SOP Assistant",
        benefit: "Drafts and tightens your statement, checked against the rest of your file.",
        icon: "sop",
        feeds: ["interview", "readiness"],
        x: 82,
        y: 26,
        href: ROUTES.sopDraft,
    },
    {
        id: "interview",
        name: "Mock Interview",
        benefit: "Voice practice with follow-up questions, then feedback on how you answered.",
        icon: "interview",
        feeds: ["readiness"],
        x: 76,
        y: 70,
        href: ROUTES.mockInterview,
    },
    {
        id: "classes",
        name: "Live Classes",
        benefit: "Expert-led sessions on preparation and interview technique.",
        icon: "classes",
        feeds: ["interview", "readiness"],
        x: 22,
        y: 72,
        href: ROUTES.resources,
    },
    {
        id: "readiness",
        name: "Readiness Score",
        benefit: "One interrogable picture of where your application actually stands.",
        icon: "readiness",
        feeds: [],
        x: 50,
        y: 52,
        href: ROUTES.readiness,
    },
]

/** The constellation's centre — everything resolves here. */
export const ECOSYSTEM_HUB = "readiness"
