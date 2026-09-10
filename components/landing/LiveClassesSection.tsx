"use client"

import { useId, useState, useTransition } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CalendarClock, CheckCircle2, GraduationCap, Loader2, MessagesSquare } from "lucide-react"
import { joinClassWaitlist } from "@/action/emailLists"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { Display, Eyebrow, Reveal, pillClass } from "./ui"

/**
 * Subject matter the classes will cover. These are topics, not scheduled
 * sessions — there is deliberately no date, instructor name or seat count here,
 * because none of that exists yet and inventing it would mislead applicants.
 */
const TOPICS = [
  "Reading a visa requirement list properly — and what officers actually look for",
  "Evidencing funds without over-explaining or contradicting your itinerary",
  "Answering interview questions about intent, ties and plans after study",
  "The mistakes that most often turn a complete application into a weak one",
]

/** Questions applicants commonly bring to sessions like these. */
const COMMON_QUESTIONS = [
  "How recent do my bank statements need to be?",
  "Should I explain a previous refusal, or leave it?",
  "Does a sponsor letter need to be notarised?",
]

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success"; message: string }

function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [pending, startTransition] = useTransition()
  const inputId = useId()
  const errorId = `${inputId}-error`

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ kind: "idle" })
    startTransition(async () => {
      const result = await joinClassWaitlist(email)
      if (result.ok) {
        setStatus({ kind: "success", message: result.message })
        setEmail("")
        trackEvent("live_class_reservation", { location: "live_classes", label: "waitlist_joined" })
      } else {
        setStatus({ kind: "error", message: result.message })
      }
    })
  }

  if (status.kind === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-4"
      >
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-0.5 shrink-0 text-emerald-500"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </motion.span>
        <p className="text-sm leading-relaxed text-lp-fg">{status.message}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-lp-muted">
        Join the class waitlist
      </label>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={status.kind === "error"}
          aria-describedby={status.kind === "error" ? errorId : undefined}
          className="h-12 min-w-0 flex-1 rounded-full border border-lp-line bg-lp-card px-5 text-sm text-lp-fg placeholder:text-lp-muted/60 focus:border-lp-azure focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure/40"
        />
        <button type="submit" disabled={pending} className={pillClass("navy", "md", "shrink-0 disabled:opacity-70")}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Adding you…
            </>
          ) : (
            "Notify me"
          )}
        </button>
      </div>

      <AnimatePresence>
        {status.kind === "error" && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium text-rose-600 dark:text-rose-400"
          >
            {status.message}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-[11px] leading-relaxed text-lp-muted">
        We&apos;ll only email you about class dates. No spam, and you can ask us to remove your address at any time.
      </p>
    </form>
  )
}

/**
 * §15 Live classes.
 *
 * The brief specifies a bookable upcoming-class card with an instructor, date,
 * seat count and live video preview. None of that data exists in the product
 * yet — there is no classes route, schedule or backend — so rather than ship a
 * fabricated listing with a dead "Reserve My Seat" button, this section is
 * honest about the launch status and offers a waitlist that genuinely records
 * the address (see `action/emailLists.ts`).
 *
 * See docs/LANDING_PAGE.md for what to swap in once real class data lands.
 */
export function LiveClassesSection() {
  const reduced = useReducedMotion()

  return (
    <section
      id="live-classes"
      aria-labelledby="classes-heading"
      className="relative scroll-mt-24 bg-lp-page px-3 py-16 md:px-5 md:py-24"
    >
      <div className="container mx-auto">
        <Reveal scale y={30} amount={0.2}>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-lp-line bg-lp-card px-6 py-12 lp-shadow md:rounded-[3rem] md:px-12 md:py-16">
            <div
              className="lp-grid-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)]"
              aria-hidden="true"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
              {/* Copy + waitlist */}
              <div>
                <Eyebrow>
                  <GraduationCap className="h-3 w-3 text-lp-azure" aria-hidden="true" />
                  Live classes
                </Eyebrow>
                <Display as="h2" size="lg" className="mt-5 text-lp-fg">
                  <span id="classes-heading">Learn directly from experienced visa educators.</span>
                </Display>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-lp-muted md:text-base">
                  Join live preparation classes, ask questions, understand common application mistakes, and learn how to
                  present your case clearly.
                </p>

                {/* Honest status — no invented dates or seat counts. */}
                <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-amber-500/8 px-3.5 py-1.5">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    {!reduced && <span className="lp-ping-soft absolute inset-0 rounded-full bg-amber-500" />}
                    <span className="relative h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
                    Classes launching soon
                  </span>
                </div>
                <p className="mt-3 max-w-xl text-xs leading-relaxed text-lp-muted">
                  Dates aren&apos;t open for booking yet. Add your email and we&apos;ll let you know once the first
                  session is scheduled — including whether a replay will be available.
                </p>

                <div className="mt-8 max-w-lg">
                  <WaitlistForm />
                </div>
              </div>

              {/* What the classes cover */}
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-lp-line bg-lp-card-2/60 p-5 md:p-6">
                  <h3 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.16em] text-lp-fg/70">
                    <CalendarClock className="h-4 w-4 text-lp-azure" aria-hidden="true" />
                    What the first sessions will cover
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {TOPICS.map((topic) => (
                      <li key={topic} className="flex items-start gap-2.5 text-[13px] leading-snug text-lp-muted">
                        <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lp-azure" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.5rem] border border-lp-line bg-lp-card-2/60 p-5 md:p-6">
                  <h3 className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.16em] text-lp-fg/70">
                    <MessagesSquare className="h-4 w-4 text-lp-azure" aria-hidden="true" />
                    Questions applicants bring
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {COMMON_QUESTIONS.map((q, i) => (
                      <li
                        key={q}
                        className={cn(
                          "rounded-2xl bg-lp-card px-3.5 py-2.5 text-[12.5px] leading-snug text-lp-fg/80",
                          i % 2 === 1 && "ml-5"
                        )}
                      >
                        &ldquo;{q}&rdquo;
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-[11px] text-lp-muted">
                    Examples of the kinds of questions these sessions are built to answer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
