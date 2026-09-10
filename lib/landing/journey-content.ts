/** Demonstration content only. These values are never applicant data or visa advice. */
export const JOURNEY_PREVIEWS = [
  {
    label: "Your starting point",
    title: "A plan that begins with you.",
    note: "A few details give your preparation a clear direction.",
    rows: [
      { label: "Destination", value: "United Kingdom" },
      { label: "Visa category", value: "Study" },
      { label: "Travel purpose", value: "Postgraduate study" },
      { label: "Expected timeline", value: "In 6 months" },
    ],
  },
  {
    label: "Your preparation roadmap",
    title: "See the next step. And the one after.",
    note: "Follow a checklist tailored to the journey you choose.",
    rows: [
      { label: "Identity documents", value: "Organize first" },
      { label: "Financial evidence", value: "Review requirements" },
      { label: "Study plans", value: "Gather supporting details" },
      { label: "Application timeline", value: "Plan your next steps" },
    ],
  },
  {
    label: "Your AI preparation workspace",
    title: "Make progress, one detail at a time.",
    note: "Bring your own information. Use feedback to improve it.",
    rows: [
      { label: "Document review", value: "Spot gaps and inconsistencies" },
      { label: "SOP assistant", value: "Structure your first draft" },
      { label: "Mock interview", value: "Practise answering aloud" },
    ],
  },
  {
    label: "Your readiness overview",
    title: "Know where to focus next.",
    note: "Readiness reflects preparation, never the likelihood of a visa decision.",
    rows: [
      { label: "Documents organized", value: "8 checked" },
      { label: "Next action", value: "Review financial evidence" },
      { label: "Interview practice", value: "Ready to begin" },
    ],
  },
] as const
