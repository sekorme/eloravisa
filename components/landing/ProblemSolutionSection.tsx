"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"
import { ArrowDown, Check, Gauge, ListChecks, Mic } from "lucide-react"
import { PROBLEM_SOLUTIONS, PREVIEW_LABEL, type ProblemSolution } from "@/lib/landing/content"
import { cn } from "@/lib/utils"
import { useLandingMotion } from "./MotionPreferences"
import { Display, Eyebrow } from "./ui"

const ICONS = { checklist: ListChecks, mic: Mic, gauge: Gauge } as const

function SolutionPreview({ type }: { type: ProblemSolution["icon"] }) {
  if (type === "checklist") {
    return <div className="space-y-2">{["Identity documents", "Financial evidence", "Travel itinerary"].map((label, index) => <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-lp-line bg-lp-card px-3 py-2.5"><span className="flex items-center gap-2 text-xs font-medium text-lp-fg"><span className={cn("flex h-4 w-4 items-center justify-center rounded-md", index < 2 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "border border-lp-muted/50")}>{index < 2 && <Check className="h-3 w-3" aria-hidden="true" />}</span>{label}</span><span className="text-[11px] text-lp-muted">{index < 2 ? "Organized" : "To prepare"}</span></div>)}</div>
  }
  if (type === "mic") {
    return <div className="rounded-xl border border-lp-line bg-lp-card p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lp-azure/10 text-lp-azure"><Mic className="h-4 w-4" aria-hidden="true" /></span><div><p className="text-xs font-semibold text-lp-fg">A little practice goes a long way.</p><p className="mt-1 text-[11px] text-lp-muted">Speak. Reflect. Try again.</p></div></div><div className="mt-4 flex h-8 items-center justify-center gap-1" aria-hidden="true">{[7, 12, 9, 20, 14, 27, 18, 30, 23, 15, 22, 12, 26, 18, 10, 16, 8, 13, 6].map((height, index) => <span key={index} className="w-1 rounded-full bg-lp-azure/55" style={{ height }} />)}</div></div>
  }
  return <div className="flex items-center gap-5 rounded-xl border border-lp-line bg-lp-card p-4"><div className="relative flex h-20 w-20 shrink-0 items-center justify-center"><svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="33" fill="none" stroke="currentColor" strokeWidth="5" className="text-lp-line" /><circle cx="40" cy="40" r="33" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="170 208" className="text-lp-azure" /></svg><span className="font-display text-xl font-semibold tracking-tight text-lp-fg">82%</span></div><div><p className="text-xs font-semibold text-lp-fg">Your next step is clear.</p><p className="mt-1 text-xs leading-relaxed text-lp-muted">Review financial evidence before moving forward.</p><span className="mt-2 block text-[10px] text-lp-muted">Sample preparation score</span></div></div>
}

function SolutionCard({ item, index }: { item: ProblemSolution; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4, once: true })
  const { enabled } = useLandingMotion()
  const resolved = inView || !enabled
  const Icon = ICONS[item.icon]

  return (
    <div ref={ref} className="lg:flex lg:min-h-[490px] lg:items-center">
      <article className={cn("relative w-full overflow-hidden rounded-[1.75rem] border bg-lp-card p-5 transition-[border-color,box-shadow] duration-500 motion-reduce:transition-none sm:p-7", resolved ? "border-lp-azure/25 shadow-[0_18px_55px_-35px_rgba(37,99,235,0.4)]" : "border-lp-line")}>
        <span className="absolute inset-x-0 top-0 h-0.5 bg-lp-line" aria-hidden="true"><motion.span className="block h-full origin-left bg-linear-to-r from-lp-azure to-[#D4AF37]" initial={false} animate={{ scaleX: resolved ? 1 : 0.08 }} transition={{ duration: enabled ? 0.7 : 0 }} /></span>
        <div className="flex items-start gap-3 border-b border-lp-line pb-5">
          <span className="mt-0.5 font-display text-xs font-medium text-lp-muted">0{index + 1}</span>
          <p className="font-display text-base leading-relaxed tracking-tight text-lp-muted sm:text-lg">&ldquo;{item.problem}&rdquo;</p>
        </div>
        <div className="my-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-lp-azure"><ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /> A clear way forward</div>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lp-azure/10 text-lp-azure"><Icon className="h-5 w-5" aria-hidden="true" /></span>
          <div><h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-lp-fg sm:text-xl">{item.solution}</h3><p className="mt-2 text-sm leading-relaxed text-lp-muted">{item.detail}</p></div>
        </div>
        <motion.div className="mt-5 rounded-2xl bg-lp-card-2/70 p-3" initial={false} animate={{ y: resolved ? 0 : 5 }} transition={{ duration: enabled ? 0.5 : 0 }}>
          <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-lp-muted">{PREVIEW_LABEL}</p>
          <SolutionPreview type={item.icon} />
        </motion.div>
      </article>
    </div>
  )
}

export function ProblemSolutionSection() {
  return (
    <section id="problem-solution" aria-labelledby="problem-heading" className="relative scroll-mt-24 bg-lp-page py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 md:px-6 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start lg:py-12">
          <Eyebrow>From overwhelmed to organized</Eyebrow>
          <Display size="lg" className="mt-5 text-lp-fg"><span id="problem-heading">Visa preparation can feel overwhelming. <span className="text-lp-azure">It doesn&apos;t have to.</span></span></Display>
          <p className="mt-6 max-w-md text-base leading-relaxed text-lp-muted">You have a destination in mind. What you need is a clear way to get prepared. Elora helps turn your biggest questions into practical next steps.</p>
          <div className="mt-8 hidden items-center gap-3 text-xs font-medium text-lp-muted lg:flex"><span className="h-px w-9 bg-lp-azure/50" aria-hidden="true" /> Less uncertainty. More direction.</div>
        </div>
        <div className="space-y-5 lg:space-y-3">{PROBLEM_SOLUTIONS.map((item, index) => <SolutionCard key={item.id} item={item} index={index} />)}</div>
      </div>
    </section>
  )
}
