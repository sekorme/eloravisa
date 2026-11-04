/**
 * Onboarding answers (users/{uid}.onboarding) and what they unlock.
 *
 * Read across both apps: residence, destination, visaType, appStatus
 * (eloraContext, interview prompts, ProfileForm, eloraadmin UserJourney);
 * refused/overstayed/sponsor/funds/concerns feed the "start here" steps below,
 * the Statement Builder prefill and the Elora assistant's context. Older
 * accounts may still hold ageRange/education/confidence/guidance/notifications,
 * which nothing reads any more.
 */

export const VISA_TYPES = ["Study", "Visit", "Work", "Family"] as const
export const APP_STATUSES = ["Not started", "In progress", "Appointment booked", "Previously refused"] as const
export const SPONSORS = ["Self", "Parent", "Spouse", "Relative", "Employer", "Scholarship"] as const
export const FUNDS_STATUS = [
  { value: "yes", label: "Yes, the money is ready" },
  { value: "partial", label: "Some of it" },
  { value: "no", label: "Not yet" },
  { value: "unsure", label: "I don't know how much I need" },
] as const
export const CONCERNS = [
  { id: "bank", label: "Bank statement" },
  { id: "docs", label: "Missing documents" },
  { id: "sop", label: "Statement of purpose" },
  { id: "interview", label: "Visa interview" },
  { id: "refusal", label: "Getting refused" },
  { id: "timeline", label: "Processing time" },
] as const

export interface OnboardingAnswers {
  residence: string
  nationality: string
  destination: string
  visaType: string
  appStatus: string
  refused: "" | "yes" | "no"
  refusalCountry: string
  refusalYear: string
  overstayed: "" | "yes" | "no"
  sponsor: string
  funds: string
  concerns: string[]
  legal1: boolean
  legal2: boolean
  legal3: boolean
}

export const EMPTY_ANSWERS: OnboardingAnswers = {
  residence: "",
  nationality: "",
  destination: "",
  visaType: "",
  appStatus: "",
  refused: "",
  refusalCountry: "",
  refusalYear: "",
  overstayed: "",
  sponsor: "",
  funds: "",
  concerns: [],
  legal1: false,
  legal2: false,
  legal3: false,
}

export const ONBOARDING_STEPS = 4

/** The first unanswered required question on a step, or null when it's complete. */
export function stepError(step: number, a: OnboardingAnswers, isCountry: (name: string) => boolean): string | null {
  if (step === 1) {
    if (!isCountry(a.residence)) return "Choose the country you live in."
    if (!isCountry(a.nationality)) return "Choose your nationality."
  }
  if (step === 2) {
    if (!isCountry(a.destination)) return "Choose the country you want to travel to."
    if (!a.visaType) return "Choose a visa type."
    if (!a.appStatus) return "Tell us where you are with your application."
  }
  if (step === 3) {
    if (!a.refused) return "Tell us whether you've been refused a visa before."
    if (a.refused === "yes" && !a.refusalCountry.trim()) return "Which country refused your visa?"
    if (!a.overstayed) return "Tell us whether you've overstayed a visa."
    if (!a.sponsor) return "Tell us who is paying for the trip."
    if (!a.funds) return "Tell us whether the money is ready."
  }
  if (step === 4) {
    if (!(a.legal1 && a.legal2 && a.legal3)) return "Please accept all three statements to continue."
  }
  return null
}

/** Maps the onboarding sponsor answer to the Statement Builder's "who's paying". */
export function fundedByFrom(sponsor?: string): "self" | "sponsor" | "both" | null {
  if (!sponsor) return null
  if (sponsor === "Self") return "self"
  if (sponsor === "Scholarship") return null
  return "sponsor"
}

export interface StartStep {
  key: string
  title: string
  why: string
  href: string
}

/**
 * Up to three first steps, chosen from the user's answers and what they've
 * already done. `user` is the users/{uid} document.
 */
export function startingSteps(user: Record<string, unknown> | null | undefined, limit = 3): StartStep[] {
  const a = (user?.onboarding ?? {}) as Partial<OnboardingAnswers>
  const concerns = new Set(a.concerns ?? [])
  const docsUploaded = Object.keys((user?.documents as object | undefined) ?? {}).length
  const steps: (StartStep & { done: boolean })[] = []

  if (a.refused === "yes" || a.appStatus === "Previously refused")
    steps.push({
      key: "refusal",
      title: "Find out why you were refused",
      why: `Upload your refusal letter${a.refusalCountry ? ` from ${a.refusalCountry}` : ""} and get a plan to fix each reason before reapplying.`,
      href: "/dashboard/refusal",
      done: !!user?.refusalRecovery,
    })
  if (a.funds === "no" || a.funds === "partial" || a.funds === "unsure" || concerns.has("bank"))
    steps.push({
      key: "statement",
      title: "Plan your bank statement",
      why: a.funds === "unsure"
        ? "See how much your embassy expects and how to build up to it over 3 to 6 months."
        : "Build a steady, genuine balance over 3 to 6 months and gather the papers that back it up.",
      href: "/dashboard/statement-builder",
      done: !!user?.statementPlan,
    })
  steps.push({
    key: "docs",
    title: "Upload your first documents",
    why: `Start your ${a.visaType ? a.visaType.toLowerCase() + " visa " : ""}checklist. Each upload gets an AI review that spots problems early.`,
    href: "/dashboard/application",
    done: docsUploaded > 0,
  })
  if (a.funds === "yes" && !concerns.has("bank"))
    steps.push({
      key: "funds",
      title: "Check your bank statement",
      why: "See your statement the way a visa officer would before you submit it.",
      href: "/dashboard/finances",
      done: !!user?.financialAnalysis,
    })
  if (concerns.has("sop"))
    steps.push({
      key: "sop",
      title: "Draft your statement of purpose",
      why: "Get a first draft built from your own details and documents.",
      href: "/dashboard/draft",
      done: false,
    })
  if (concerns.has("interview") || a.appStatus === "Appointment booked")
    steps.push({
      key: "interview",
      title: "Practise your visa interview",
      why: "Answer the questions officers ask and get feedback on each answer.",
      href: "/dashboard/ai-mock-interview",
      done: false,
    })
  if (a.appStatus === "Appointment booked")
    steps.push({
      key: "appointment",
      title: "Add your appointment date",
      why: "We'll count down and remind you what to bring.",
      href: "/dashboard/appointment",
      done: !!user?.appointment,
    })
  if (concerns.has("timeline"))
    steps.push({
      key: "info",
      title: "Check processing times",
      why: "See fees, processing times and embassy details for your destination.",
      href: "/dashboard/information",
      done: false,
    })

  return steps.filter((s) => !s.done).slice(0, limit).map((s) => ({ key: s.key, title: s.title, why: s.why, href: s.href }))
}
