/**
 * Single source of truth for the marketing homepage copy.
 *
 * Everything a non-developer is likely to want to change — headlines, CTA
 * labels, destination lists, tool descriptions, FAQ entries — lives here as
 * plain typed data so the section components stay presentational. This is
 * deliberately CMS-shaped: each export is a serialisable array/object that
 * could later be fetched instead of imported without touching the components.
 *
 * Rules for editing:
 *  - Never add a statistic, testimonial or success claim here. Verified stats
 *    come from `lib/publicStats.ts`; pricing comes from `lib/subscriptions.ts`.
 *  - Never promise a visa outcome. Elora prepares applicants, it does not
 *    decide applications.
 *  - Any `href` added here must resolve to a real route.
 */

/* -------------------------------------------------------------------------- */
/*  Shared CTA labels                                                         */
/* -------------------------------------------------------------------------- */

export const CTA = {
  /** Primary conversion action across the whole page. */
  primary: "Start Preparing for Free",
  /** Secondary action pointing at the mock-interview experience. */
  secondary: "Try AI Mock Interview",
  /** Reassurance shown directly beneath the hero buttons. */
  microcopy: "Start free • No credit card required • Upgrade when you're ready",
  /** Honesty note about what the platform is and isn't. */
  trustNote: "Built to support applicants—not replace official immigration advice.",
} as const

/* -------------------------------------------------------------------------- */
/*  §7 Hero                                                                   */
/* -------------------------------------------------------------------------- */

export const HERO = {
  eyebrow: "AI-Powered Visa Preparation",
  /** Rendered as two lines; `headlineAccent` gets the gradient sweep. */
  headline: "Prepare Your Visa Application",
  headlineAccent: "With Confidence.",
  supporting:
    "Get personalized guidance, review your documents, practise your visa interview, and understand your application readiness—all in one intelligent platform.",
  /** The compact journey row under the CTAs. */
  journey: ["Choose destination", "Prepare documents", "Practise interview"],
  scrollCue: "Explore your journey",
} as const

/**
 * The three cards floating around the hero orb. These are a *product preview*,
 * not the visitor's own results — `previewLabel` is rendered visibly so that
 * is never ambiguous.
 */
export const HERO_PREVIEW_CARDS = [
  { id: "review", title: "Document Review", value: "8 documents checked", icon: "file" },
  { id: "interview", title: "Interview Practice", value: "Ready to begin", icon: "mic" },
  { id: "readiness", title: "Application Readiness", value: "82% prepared", icon: "gauge" },
] as const

export const PREVIEW_LABEL = "Sample preview"

/* -------------------------------------------------------------------------- */
/*  §8 Destination ribbon                                                     */
/* -------------------------------------------------------------------------- */

export type Destination = { name: string; code: string }

export const DESTINATIONS: Destination[] = [
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "United States", code: "US" },
  { name: "Germany", code: "DE" },
  { name: "Australia", code: "AU" },
  { name: "Ireland", code: "IE" },
  { name: "France", code: "FR" },
  { name: "New Zealand", code: "NZ" },
]

export const DESTINATION_CAPTION =
  "Personalized preparation for your chosen destination and visa category."

/* -------------------------------------------------------------------------- */
/*  §9 Problem → solution                                                     */
/* -------------------------------------------------------------------------- */

export type ProblemSolution = {
  id: string
  /** The applicant's worry, in their own words. */
  problem: string
  /** What Elora gives them instead. */
  solution: string
  detail: string
  icon: "checklist" | "mic" | "gauge"
}

export const PROBLEM_SOLUTIONS: ProblemSolution[] = [
  {
    id: "documents",
    problem: "I don't know which documents I need.",
    solution: "Personalized document checklist",
    detail:
      "A checklist built around your destination and visa category, so you can see every requirement in one place and tick it off as you go.",
    icon: "checklist",
  },
  {
    id: "interview",
    problem: "I'm worried about the visa interview.",
    solution: "Realistic AI mock interviews",
    detail:
      "Practise answering real interview questions out loud within your available AI credits, and get structured feedback on clarity and completeness.",
    icon: "mic",
  },
  {
    id: "readiness",
    problem: "I don't know whether my application is ready.",
    solution: "Application readiness insights",
    detail:
      "See which requirements are still outstanding and what deserves another look before you submit to the relevant authority.",
    icon: "gauge",
  },
]

/* -------------------------------------------------------------------------- */
/*  §10 How Elora works                                                       */
/* -------------------------------------------------------------------------- */

export type JourneyStep = { title: string; description: string; icon: "target" | "map" | "sparkles" | "gauge" }

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    title: "Tell Elora your goal",
    description: "Choose your destination, visa category, travel purpose, and expected timeline.",
    icon: "target",
  },
  {
    title: "Get your preparation plan",
    description: "Receive a personalized checklist and structured application roadmap.",
    icon: "map",
  },
  {
    title: "Improve with AI tools",
    description: "Review documents, draft your SOP, and practise realistic interview questions.",
    icon: "sparkles",
  },
  {
    title: "Track your readiness",
    description: "Identify missing requirements and monitor your preparation progress.",
    icon: "gauge",
  },
]

/* -------------------------------------------------------------------------- */
/*  §12 Mock interview spotlight                                              */
/* -------------------------------------------------------------------------- */

export const INTERVIEW_SPOTLIGHT = {
  headline: "Walk into your interview already knowing what practice feels like.",
  supporting:
    "Answer realistic questions aloud, receive structured feedback, and repeat the session until you feel more prepared.",
  /** The question typed out in the demo interface. */
  question: "Why did you choose this course and institution?",
  /** Feedback categories revealed after the simulated answer. */
  feedback: [
    { label: "Clarity", note: "Structure your answer around one clear reason." },
    { label: "Completeness", note: "Mention the course content, not only the country." },
    { label: "Confidence", note: "Steady pace — avoid trailing off at the end." },
  ],
  cta: "Practise My Interview",
} as const

/* -------------------------------------------------------------------------- */
/*  §13 Document readiness                                                    */
/* -------------------------------------------------------------------------- */

export const READINESS_DEMO = {
  headline: "Know what deserves your attention before you submit.",
  supporting:
    "Elora reads through what you've gathered, groups it, and points out the gaps that applicants most often miss.",
  before: {
    label: "Before Elora",
    files: [
      { name: "scan_001.pdf", issue: "Unclear filename" },
      { name: "bank statement (2).pdf", issue: "Dates inconsistent with itinerary" },
      { name: "passport.jpg", issue: null },
      { name: "IMG_4471.jpeg", issue: "Unclear filename" },
    ],
    missing: "Proof of funds for the full stay",
    status: "No preparation status",
  },
  after: {
    label: "After Elora",
    groups: [
      { name: "Identity", complete: true, count: "2 of 2" },
      { name: "Financial", complete: false, count: "1 of 2" },
      { name: "Travel plans", complete: true, count: "3 of 3" },
      { name: "Supporting letters", complete: true, count: "1 of 1" },
    ],
    actions: [
      "Add a bank statement covering the full period of stay",
      "Align the statement dates with your travel itinerary",
      "Rename scanned files so each one is identifiable",
    ],
    readiness: "82% prepared",
  },
  disclaimer:
    "Elora provides preparation guidance. Always confirm final requirements through the relevant official authority.",
} as const

/* -------------------------------------------------------------------------- */
/*  §19 FAQ — also the source for FAQPage structured data                     */
/* -------------------------------------------------------------------------- */

export type Faq = { q: string; a: string }

/**
 * Rendered verbatim in the accordion AND emitted as FAQPage JSON-LD, so the
 * structured data can never drift from what a visitor actually sees. Keep the
 * answers plain text — no markup — for that reason.
 */
export const FAQS: Faq[] = [
  {
    q: "What is Elora Visa?",
    a: "Elora Visa is a self-guided visa preparation platform. It gives you a personalized document checklist, AI feedback on the documents you upload, practice visa interviews, help drafting a statement of purpose, and a view of how ready your application is. You prepare and submit your own application.",
  },
  {
    q: "Can Elora Visa guarantee that my visa will be approved?",
    a: "No. Visa decisions are made solely by the relevant immigration authority, and nobody can guarantee an outcome. Elora Visa helps you prepare a clearer, better-organized application and spot gaps before you submit.",
  },
  {
    q: "Which countries and visa categories are supported?",
    a: "Elora's guidance adapts to a wide range of destinations and categories, including study, visitor, work-related, family and dependent, and business or conference travel. Popular destinations include the United Kingdom, Canada, the United States, Germany, Australia, Ireland, France and New Zealand. You choose your destination and category during onboarding.",
  },
  {
    q: "How does the AI mock interview work?",
    a: "You start a voice session from your dashboard and answer realistic visa interview questions out loud. At the end you receive structured feedback on clarity, completeness and confidence. You can repeat the session as often as your plan's AI credits allow.",
  },
  {
    q: "Is my uploaded information secure?",
    a: "Elora uses account sign-in and encrypted connections on its website. Uploaded documents are processed to provide the services you request. Read our Privacy Policy for details about storage, third-party AI processing and how to contact us about your information.",
  },
  {
    q: "Can Elora Visa write my entire SOP?",
    a: "The SOP assistant can help create a structured first draft from your background and goals. Review every detail and refine it in your own voice. You are responsible for making sure your statement is accurate and meets your application requirements.",
  },
  {
    q: "Does Elora replace an immigration lawyer or official embassy guidance?",
    a: "No. Elora Visa is not a law firm, immigration consultancy, embassy or government body, and it does not provide legal advice. Use it to prepare, and confirm final requirements with the official authority for your destination — or a qualified adviser if your case is complex.",
  },
  {
    q: "Can I use Elora Visa for free?",
    a: "Yes. The free plan includes a monthly allowance of AI credits, checklist access and secure document storage, with no credit card required. You can upgrade later if you need more AI credits or additional tools.",
  },
  {
    q: "How do live visa classes work?",
    a: "Live classes are not open for booking yet. Join the class waitlist on this page to receive confirmed dates when they are announced. Joining the waitlist does not reserve a seat.",
  },
  {
    q: "Can I delete my uploaded documents and account data?",
    a: "You can remove documents from your dashboard. For deletion of stored files and account data, contact info@eloravisa.com so the team can help with your request. Removing a dashboard entry should not be assumed to erase every stored copy immediately.",
  },
]

/* -------------------------------------------------------------------------- */
/*  §20 Final conversion                                                      */
/* -------------------------------------------------------------------------- */

export const FINAL_CTA = {
  headline: "Your journey deserves more than guesswork.",
  supporting:
    "Start with a clear plan, prepare every important detail, and approach your application with greater confidence.",
  secondary: "Explore Elora's AI Tools",
} as const

/* -------------------------------------------------------------------------- */
/*  §21 Footer                                                                */
/* -------------------------------------------------------------------------- */

export type FooterLink = { label: string; href: string }

/**
 * Only routes that actually exist are listed. An AI Usage Policy and a
 * standalone Data Deletion page are referenced by the brief but have not been
 * authored yet — see docs/LANDING_PAGE.md before adding them here, so the
 * footer never ships a dead link.
 */
export const FOOTER_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "AI Document Review", href: "/ai-tools" },
      { label: "Mock Interview", href: "/#mock-interview" },
      { label: "SOP Assistant", href: "/ai-tools" },
      { label: "Smart Checklist", href: "/#ai-tools" },
      { label: "Live Classes", href: "/#live-classes" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Destinations",
    links: [
      { label: "United Kingdom", href: "/visa-guidance" },
      { label: "Canada", href: "/visa-guidance" },
      { label: "United States", href: "/visa-guidance" },
      { label: "Germany", href: "/visa-guidance" },
      { label: "Australia", href: "/visa-guidance" },
      { label: "Other Destinations", href: "/visa-guidance" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Visa Guides", href: "/resources" },
      { label: "Application Tips", href: "/resources" },
      { label: "Interview Preparation", href: "/#mock-interview" },
      { label: "Help Center", href: "/contact" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Elora Visa", href: "/about" },
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms", href: "/legal/terms-of-service" },
      { label: "AI usage guidance", href: "/legal/privacy-policy#ai-processing" },
      { label: "Data deletion help", href: "/legal/privacy-policy#contact" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
    ],
  },
]

export const FOOTER_DISCLAIMER =
  "Elora Visa is an independent visa preparation platform. It is not affiliated with any embassy, government, immigration authority, or visa application center. Information provided through the platform is for preparation and educational purposes and should be verified using official sources."

export const FOOTER_ATTRIBUTION = "Powered by Souhait Hub"
