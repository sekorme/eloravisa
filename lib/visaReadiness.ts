/**
 * Visa readiness: one score per user, what to fix next, and whether each
 * document is still valid on the day of the embassy appointment.
 *
 * Pure functions, no Firebase: the dashboard computes this in the browser,
 * the reminder cron on the server, and eloraadmin keeps an identical copy
 * (lib/visaReadiness.ts there) so admins see the same numbers as users.
 * Change both copies together.
 */

export interface RequiredDocument {
  key: string
  title: string
}

/** The parts of a reviews/{docKey} doc this needs (written by the AI review). */
export interface ReviewFacts {
  id: string
  score?: number
  improvement_suggestions?: string[]
  /** YYYY-MM-DD, extracted by the AI review when the document shows one. */
  issueDate?: string | null
  expiryDate?: string | null
}

export interface ReadinessInput {
  requiredDocuments: RequiredDocument[]
  uploadedKeys: string[]
  reviews: ReviewFacts[]
  /** overallScore of scored mock interviews, newest first. */
  interviewScores: number[]
  /** Embassy appointment, ms since epoch. */
  appointmentAt: number | null
  now: number
}

export type ValidityStatus = "expired" | "expires_before_appointment" | "short_validity" | "expiring_soon" | "ok"

export interface DocumentValidity {
  key: string
  title: string
  validUntil: string // YYYY-MM-DD
  status: ValidityStatus
  message: string
}

export interface NextStep {
  id: string
  label: string
  detail: string
  /** Rough points the score would gain; orders steps within a stage. */
  impact: number
  href: string
}

export interface ReadinessResult {
  score: number
  parts: { documents: number; review: number; interview: number }
  nextSteps: NextStep[]
  validity: DocumentValidity[]
  uploadedRequired: number
  reviewedRequired: number
  missing: RequiredDocument[]
}

const DAY = 24 * 60 * 60 * 1000

/**
 * The order an applicant should work in. Steps sort by stage first, so a new
 * user is told to upload documents before a mock interview (which uses their
 * reviewed documents), even though one interview adds more points than one
 * upload. Unknown ids sort last.
 */
const STAGES = ["renew", "upload", "review", "improve", "check", "interview", "add"]
const stageOf = (id: string) => {
  const i = STAGES.indexOf(id.split("-")[0])
  return i === -1 ? STAGES.length : i
}
const WEIGHTS = { documents: 0.35, review: 0.35, interview: 0.3 }
const GOOD_SCORE = 70
/** Points off the total per document that won't be valid in time. */
const VALIDITY_PENALTY = 10

/**
 * How long a document stays acceptable, by key. Embassies differ; these are
 * the common rules, and the messages tell users to check theirs.
 */
const VALIDITY_RULES: Record<string, { freshForDays?: number; validBeyondDays?: number }> = {
  // Most embassies want 6 months of validity left on the travel date.
  passport: { validBeyondDays: 182 },
  // Statements are usually expected to be under 3 months old.
  financialStatement: { freshForDays: 90 },
  // Police certificates are usually accepted for about 6 months.
  policeCertificate: { freshForDays: 182 },
}

const toMs = (ymd: string | null | undefined) => {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null
  const t = Date.parse(`${ymd}T00:00:00Z`)
  return Number.isFinite(t) ? t : null
}
const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const fmt = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

/** When a document stops being acceptable, or null if unknown. */
function validUntilMs(key: string, review: ReviewFacts): number | null {
  const rule = VALIDITY_RULES[key] ?? {}
  const expiry = toMs(review.expiryDate)
  const issued = toMs(review.issueDate)
  const fromFreshness = issued !== null && rule.freshForDays ? issued + rule.freshForDays * DAY : null
  if (expiry !== null && fromFreshness !== null) return Math.min(expiry, fromFreshness)
  return expiry ?? fromFreshness
}

export function documentValidity(input: Pick<ReadinessInput, "requiredDocuments" | "reviews" | "appointmentAt" | "now">): DocumentValidity[] {
  const titles = new Map(input.requiredDocuments.map((d) => [d.key, d.title]))
  const deadline = input.appointmentAt ?? input.now
  const out: DocumentValidity[] = []
  for (const review of input.reviews) {
    const until = validUntilMs(review.id, review)
    if (until === null) continue
    const title = titles.get(review.id) ?? review.id
    const beyond = (VALIDITY_RULES[review.id]?.validBeyondDays ?? 0) * DAY
    let status: ValidityStatus = "ok"
    let message = `Valid until ${fmt(until)}.`
    if (until < input.now) {
      status = "expired"
      message = `Expired on ${fmt(until)}. Get a new one before you apply.`
    } else if (input.appointmentAt && until < input.appointmentAt) {
      status = "expires_before_appointment"
      message = `Runs out on ${fmt(until)}, before your appointment. Renew it first.`
    } else if (beyond && until < deadline + beyond) {
      status = "short_validity"
      message = `Valid until ${fmt(until)}. Many embassies need 6 months left after you travel; check yours and renew if needed.`
    } else if (until < input.now + 30 * DAY) {
      status = "expiring_soon"
      message = `Runs out on ${fmt(until)}, within 30 days.`
    }
    out.push({ key: review.id, title, validUntil: ymd(until), status, message })
  }
  const order: ValidityStatus[] = ["expired", "expires_before_appointment", "short_validity", "expiring_soon", "ok"]
  return out.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.validUntil.localeCompare(b.validUntil))
}

export function computeReadiness(input: ReadinessInput): ReadinessResult {
  const required = input.requiredDocuments
  const uploaded = new Set(input.uploadedKeys)
  const reviews = new Map(input.reviews.map((r) => [r.id, r]))
  const missing = required.filter((d) => !uploaded.has(d.key))
  const present = required.filter((d) => uploaded.has(d.key))
  const reviewed = present.filter((d) => typeof reviews.get(d.key)?.score === "number")

  const documents = required.length ? (present.length / required.length) * 100 : 0
  // Unreviewed uploads count as 0 so reviewing them raises the score.
  const review = present.length
    ? present.reduce((s, d) => s + (reviews.get(d.key)?.score ?? 0), 0) / present.length
    : 0
  const recent = input.interviewScores.slice(0, 3)
  const interview = recent.length ? recent.reduce((s, x) => s + x, 0) / recent.length : 0

  const validity = documentValidity(input)
  const invalid = validity.filter((v) => v.status === "expired" || v.status === "expires_before_appointment")
  const raw = documents * WEIGHTS.documents + review * WEIGHTS.review + interview * WEIGHTS.interview
  const score = Math.max(0, Math.min(100, Math.round(raw - invalid.length * VALIDITY_PENALTY)))

  const steps: NextStep[] = []
  for (const v of invalid) {
    steps.push({ id: `renew-${v.key}`, label: `Renew your ${v.title}`, detail: v.message, impact: VALIDITY_PENALTY + 5, href: "/dashboard/application" })
  }
  const perDoc = required.length ? (100 / required.length) * WEIGHTS.documents : 0
  for (const d of missing) {
    steps.push({ id: `upload-${d.key}`, label: `Upload your ${d.title}`, detail: "It's on your required list and not uploaded yet.", impact: perDoc, href: "/dashboard/application" })
  }
  const perReview = present.length ? (WEIGHTS.review * 100) / present.length : 0
  for (const d of present) {
    const r = reviews.get(d.key)
    if (typeof r?.score !== "number") {
      steps.push({ id: `review-${d.key}`, label: `Run an AI review on your ${d.title}`, detail: "Catch problems before the visa officer does.", impact: perReview, href: "/dashboard/application" })
    } else if (r.score < GOOD_SCORE) {
      steps.push({
        id: `improve-${d.key}`,
        label: `Improve your ${d.title} (scored ${r.score})`,
        detail: r.improvement_suggestions?.[0] ?? "See the review for what to fix, then upload a new version.",
        impact: (perReview * (GOOD_SCORE - r.score)) / 100,
        href: "/dashboard/application",
      })
    }
  }
  if (!recent.length) {
    steps.push({ id: "interview-first", label: "Take a mock interview", detail: "Practise the questions you're likely to be asked.", impact: WEIGHTS.interview * 60, href: "/dashboard/ai-mock-interview" })
  } else if (interview < GOOD_SCORE) {
    steps.push({ id: "interview-again", label: `Practise your interview again (averaging ${Math.round(interview)})`, detail: "Aim for 70 or more across your last three sessions.", impact: (WEIGHTS.interview * (GOOD_SCORE - interview)), href: "/dashboard/ai-mock-interview" })
  }
  for (const v of validity.filter((x) => x.status === "short_validity" || x.status === "expiring_soon")) {
    steps.push({ id: `check-${v.key}`, label: `Check your ${v.title}'s validity`, detail: v.message, impact: 3, href: "/dashboard/application" })
  }
  if (!input.appointmentAt) {
    steps.push({ id: "add-appointment", label: "Add your embassy appointment", detail: "Get reminders and a countdown, and we'll check your documents are valid on the day.", impact: 2, href: "/dashboard/appointment" })
  }

  return {
    score,
    parts: { documents: Math.round(documents), review: Math.round(review), interview: Math.round(interview) },
    nextSteps: steps.sort((a, b) => stageOf(a.id) - stageOf(b.id) || b.impact - a.impact),
    validity,
    uploadedRequired: present.length,
    reviewedRequired: reviewed.length,
    missing,
  }
}

/** Interview scores newest first, from interview_sessions docs. */
export function interviewScoresFrom(sessions: { date?: unknown; feedback?: { overallScore?: number } }[]): number[] {
  return sessions
    .filter((s) => typeof s.feedback?.overallScore === "number")
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))
    .map((s) => s.feedback!.overallScore!)
}

/** Things to bring on the day: the fixed basics plus the user's documents. */
export function appointmentChecklist(requiredDocuments: RequiredDocument[]): { key: string; label: string }[] {
  return [
    { key: "passport-original", label: "Your original passport, plus any old passports with previous visas" },
    { key: "confirmation", label: "Printed appointment confirmation" },
    { key: "application-form", label: "Visa application form confirmation page, printed" },
    { key: "photos", label: "Passport photos that meet the embassy's size rules" },
    { key: "fee-receipt", label: "Visa fee payment receipt" },
    ...requiredDocuments
      .filter((d) => d.key !== "passport")
      .map((d) => ({ key: `doc-${d.key}`, label: `${d.title}: original and a photocopy` })),
    { key: "arrive-early", label: "Plan to arrive 30 minutes early; most embassies don't allow phones or bags inside" },
  ]
}
