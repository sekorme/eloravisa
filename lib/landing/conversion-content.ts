/**
 * Publish only approved content here. An empty array is intentional: the
 * homepage must not turn illustrative customer stories into social proof.
 */
export type ApprovedTestimonial = {
  id: string
  approved: true
  name: string
  destination: string
  tool: string
  quote: string
  /** Optional image with the customer's permission; use a local asset path. */
  image?: { src: string; alt: string }
}

export const APPROVED_TESTIMONIALS: readonly ApprovedTestimonial[] = []

export const LIVE_CLASSES = {
  heading: "Learn directly from experienced visa educators.",
  description:
    "A space to ask questions, understand common application mistakes, and learn how to present your case clearly.",
  status: "Class dates coming soon",
  availability:
    "There are no classes open for booking yet. Join the waitlist to hear when confirmed dates are announced.",
  topics: ["Document preparation", "Interview practice", "Your application questions"],
  questions: [
    "How can I organize my supporting documents?",
    "What should I practise before an interview?",
  ],
} as const

/** Linked to existing published policies; these are not new legal policies. */
export const PREPARATION_POLICY_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "AI usage guidance", href: "/legal/privacy-policy#ai-processing" },
  { label: "Data deletion help", href: "/legal/privacy-policy#contact" },
] as const

/** Describes implemented controls and published policy without unverified guarantees. */
export const TRUST_MEASURES = [
  {
    icon: "signin",
    title: "Sign in to your workspace",
    description: "Use your own account to access your preparation tools, document list, and interview history.",
  },
  {
    icon: "documents",
    title: "Manage what you share",
    description: "Choose documents to review and remove entries from your document list when you no longer need them.",
  },
  {
    icon: "privacy",
    title: "Understand your data",
    description: "Our Privacy Policy explains the information we collect, how it is used, and how to contact us.",
  },
  {
    icon: "ai",
    title: "Know the AI boundaries",
    description: "AI offers preparation feedback. Review its suggestions and confirm requirements with official sources.",
  },
  {
    icon: "consent",
    title: "A clear AI processing policy",
    description: "Our policy states that personal data is not used to train our public AI models without explicit consent.",
  },
  {
    icon: "deletion",
    title: "Get help with deletion",
    description: "Contact our privacy support team to ask about removing your account information or application data.",
  },
] as const
