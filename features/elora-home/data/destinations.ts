import type { Destination } from "../types"

/**
 * Destinations shown on the globe in Scene 6.
 *
 * ------------------------------------------------------------------------
 * WHAT IS AND IS NOT ALLOWED IN THIS FILE
 * ------------------------------------------------------------------------
 * Allowed: the names of visa *categories* that exist publicly, and the
 * *preparation areas* Elora focuses on for that route. These are descriptions
 * of our own product behaviour.
 *
 * Not allowed, ever: processing times, application fees, success or refusal
 * rates, eligibility rulings, or "you will need X" statements phrased as legal
 * requirements. Those change without notice, vary by applicant, and an
 * applicant who relies on a stale number here can lose money or miss a window.
 * Every entry is framed as what we help you *prepare*, not what the state
 * *requires*.
 *
 * `lat`/`lon` are real geographic coordinates, used to place markers on the
 * globe and to render the flight-path arcs.
 */
export const DESTINATIONS: Destination[] = [
    {
        id: "uk",
        name: "United Kingdom",
        code: "GB",
        lat: 51.5,
        lon: -0.13,
        categories: ["Student route", "Skilled Worker", "Standard Visitor"],
        preparation: [
            "Financial evidence held for the required period",
            "Course and sponsor documentation",
            "Accommodation and maintenance planning",
        ],
        interviewRelevance: "Varies by route",
        documents: ["Passport", "Financial evidence", "Sponsor documents", "Statement of purpose"],
    },
    {
        id: "ca",
        name: "Canada",
        code: "CA",
        lat: 45.42,
        lon: -75.7,
        categories: ["Study permit", "Work permit", "Visitor visa"],
        preparation: [
            "Letter of acceptance and study plan",
            "Proof of funds and their source",
            "Ties to your home country",
        ],
        interviewRelevance: "Varies by route",
        documents: ["Passport", "Letter of acceptance", "Proof of funds", "Study plan"],
    },
    {
        id: "us",
        name: "United States",
        code: "US",
        lat: 38.9,
        lon: -77.04,
        categories: ["F-1 student", "B1/B2 visitor", "J-1 exchange"],
        preparation: [
            "Interview practice — this route is interview-led",
            "Consistency between your form and your answers",
            "Clear, evidenced funding narrative",
        ],
        interviewRelevance: "High",
        documents: ["Passport", "Form confirmation", "Financial evidence", "Institution documents"],
    },
    {
        id: "de",
        name: "Germany",
        code: "DE",
        lat: 52.52,
        lon: 13.4,
        categories: ["National visa (student)", "Job seeker", "Schengen visitor"],
        preparation: [
            "Blocked account and financing documentation",
            "Admission and enrolment paperwork",
            "Appointment preparation",
        ],
        interviewRelevance: "Moderate",
        documents: ["Passport", "Admission letter", "Financing evidence", "Health insurance"],
    },
    {
        id: "ie",
        name: "Ireland",
        code: "IE",
        lat: 53.35,
        lon: -6.26,
        categories: ["Study visa", "Employment permit", "Short stay"],
        preparation: [
            "Course fees and funding evidence",
            "Accommodation and insurance planning",
            "Purpose-of-visit letter",
        ],
        interviewRelevance: "Moderate",
        documents: ["Passport", "Acceptance letter", "Financial evidence", "Insurance"],
    },
    {
        id: "au",
        name: "Australia",
        code: "AU",
        lat: -35.28,
        lon: 149.13,
        categories: ["Student visa", "Skilled visa", "Visitor visa"],
        preparation: [
            "Genuine study and stay documentation",
            "Health and insurance requirements",
            "Financial capacity evidence",
        ],
        interviewRelevance: "Moderate",
        documents: ["Passport", "Confirmation of enrolment", "Financial evidence", "Health cover"],
    },
]

/** Where the applicant is travelling *from* — the origin of every flight arc. */
export const ORIGIN = { name: "Accra", code: "GH", lat: 5.6, lon: -0.19 } as const
