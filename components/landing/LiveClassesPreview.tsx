"use client"

import Link from "next/link"
import { useId, useState, useTransition, type FormEvent } from "react"
import { motion } from "motion/react"
import { ArrowRight, CalendarClock, CheckCircle2, GraduationCap, Loader2, MessageCircle, Video } from "lucide-react"
import { joinClassWaitlist } from "@/action/emailLists"
import { trackEvent } from "@/lib/analytics"
import { LIVE_CLASSES } from "@/lib/landing/conversion-content"
import { useLandingMotion } from "./MotionPreferences"
import { Display, Eyebrow } from "./ui"

type FormStatus = { kind: "idle" } | { kind: "error" | "success"; message: string }

function ClassWaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" })
  const [pending, startTransition] = useTransition()
  const id = useId()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setStatus({ kind: "idle" })
    startTransition(async () => {
      try {
        const result = await joinClassWaitlist(email)
        if (result.ok) {
          setStatus({ kind: "success", message: result.message })
          setEmail("")
          // This records interest only; no class reservation has been made.
          trackEvent("section_cta_click", { location: "live_classes", label: "waitlist_joined" })
        } else {
          setStatus({ kind: "error", message: result.message })
        }
      } catch {
        setStatus({ kind: "error", message: "We couldn't add your email. Please try again or contact us for help." })
      }
    })
  }

  return (
    <div className="mt-8 max-w-lg">
      <form onSubmit={onSubmit} className="space-y-3" aria-busy={pending}>
        <label htmlFor={id} className="block text-sm font-semibold text-lp-fg">Get notified about upcoming classes</label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input id={id} type="email" name="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" aria-invalid={status.kind === "error"} aria-describedby={`${id}-description${status.kind !== "idle" ? ` ${id}-status` : ""}`} className="min-h-12 min-w-0 flex-1 rounded-xl border border-lp-line bg-lp-card px-4 text-base text-lp-fg placeholder:text-lp-muted focus:border-lp-azure focus:outline-none focus:ring-2 focus:ring-lp-azure/30" />
          <button type="submit" disabled={pending || status.kind === "success"} className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-lp-azure px-5 text-sm font-semibold text-white transition-colors hover:bg-lp-azure-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-70">
            {pending ? <><Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> Joining…</> : status.kind === "success" ? <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> On the list</> : <>Notify me<ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" /></>}
          </button>
        </div>
        <p id={`${id}-description`} className="text-xs leading-6 text-lp-muted">Joining the waitlist does not reserve a seat. By joining, you agree to receive class updates. <Link href="/legal/privacy-policy" className="rounded underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure">Privacy Policy</Link></p>
        <p id={`${id}-status`} role={status.kind === "error" ? "alert" : "status"} className={`min-h-6 text-sm leading-6 ${status.kind === "error" ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>{status.kind !== "idle" ? status.message : ""}</p>
      </form>
      <noscript><p className="text-sm text-lp-muted">To join without JavaScript, <a href="mailto:info@eloravisa.com?subject=Live%20class%20waitlist" className="underline">email the team</a>.</p></noscript>
      <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-lp-muted underline-offset-4 hover:text-lp-azure hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure">Have a question? Contact the team<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
    </div>
  )
}

/** No class schedule exists yet. This is a real waitlist with a labelled concept preview. */
export function LiveClassesPreview() {
  const { enabled } = useLandingMotion()
  return (
    <section id="live-classes" aria-labelledby="classes-heading" className="relative scroll-mt-28 bg-lp-page px-5 py-20 sm:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <Eyebrow><GraduationCap className="h-3.5 w-3.5 text-lp-azure" aria-hidden="true" /> Learn together</Eyebrow>
          <Display as="h2" size="lg" className="mt-6 text-lp-fg"><span id="classes-heading">{LIVE_CLASSES.heading}</span></Display>
          <p className="mt-6 max-w-xl text-base leading-7 text-lp-muted">{LIVE_CLASSES.description}</p>
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-lp-line bg-lp-card p-4">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-lp-azure" aria-hidden="true" />
            <div><p className="text-sm font-semibold text-lp-fg">{LIVE_CLASSES.status}</p><p className="mt-1 text-sm leading-6 text-lp-muted">{LIVE_CLASSES.availability}</p></div>
          </div>
          <ClassWaitlistForm />
        </div>

        <motion.div initial={false} whileInView={enabled ? { y: [12, 0] } : undefined} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }} className="relative rounded-[1.75rem] border border-lp-line bg-lp-card p-3 shadow-[0_24px_70px_-36px_rgba(11,36,71,0.28)] sm:p-4">
          <div className="relative overflow-hidden rounded-[1.1rem] bg-[#0B2447] p-5 text-white sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_5%,rgba(34,211,238,0.12),transparent_60%)]" />
            <div className="relative flex items-center justify-between gap-3 text-[11px] text-slate-300"><span className="flex items-center gap-2"><Video className="h-4 w-4 text-emerald-300" aria-hidden="true" /> Elora classroom</span><span className="rounded-full border border-white/15 px-2.5 py-1">Concept preview</span></div>
            <div className="relative py-10 sm:py-12">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">A little guidance. A clearer plan.</span>
              <p className="mt-4 max-w-xs font-display text-3xl font-semibold leading-[1.18] tracking-tight sm:text-4xl">Bring your questions.<br />Build your confidence.</p>
            </div>
            <div className="relative flex flex-wrap gap-2">{LIVE_CLASSES.topics.map((topic) => <span key={topic} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200">{topic}</span>)}</div>
          </div>
          <div className="px-2 pb-2 pt-5 sm:px-3">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium text-lp-muted"><MessageCircle className="h-4 w-4 text-lp-azure" aria-hidden="true" /> Sample questions, not a live chat</div>
            <ul className="space-y-2.5">{LIVE_CLASSES.questions.map((question, index) => <li key={question} className={`rounded-2xl rounded-tl-sm bg-lp-card-2 px-4 py-3 text-sm leading-6 text-lp-fg ${index === 1 ? "ml-5" : "mr-5"}`}>{question}</li>)}</ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
