"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Check, UserPlus, RotateCcw, GraduationCap, Briefcase, Mic, Pause, Play, Sparkles } from "lucide-react"
import { SignupSheet } from "@/components/auth/SignupSheet"
import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/motion"

const AUTOPLAY_DELAY = 6000

const JOURNEYS = [
  {
    id: "first-time",
    label: "First-time applicant",
    icon: UserPlus,
    image: "/firsttime.png",
    steps: [
      "Choose your destination and visa category",
      "Build a personalized document checklist",
      "Review your documents with AI before you submit",
      "Practise an interview if one is required",
    ],
    tool: "Personalized Visa Checklist",
  },
  {
    id: "refusal",
    label: "Reapplying after a refusal",
    icon: RotateCcw,
    image: "/pastrefusal.png",
    steps: [
      "Understand the reasons behind the refusal",
      "Identify missing or weak evidence",
      "Strengthen the new application",
      "Prepare to explain material changes",
      "Review documents before resubmitting",
    ],
    tool: "AI Document Review",
  },
  {
    id: "study",
    label: "Planning to study abroad",
    icon: GraduationCap,
    image: "/studentworker.png",
    steps: [
      "Confirm study-permit requirements for your destination",
      "Organize academic and financial documents",
      "Get AI feedback before submission",
      "Prepare for a study-visa interview",
    ],
    tool: "AI Visa Guidance",
  },
  {
    id: "work-visit",
    label: "Applying to work or visit",
    icon: Briefcase,
    image: "/elora4.jpeg",
    steps: [
      "Identify the right visa category for your purpose",
      "Build a checklist for work or visitor requirements",
      "Organize supporting documents securely",
      "Understand what to expect at your appointment",
    ],
    tool: "Secure Document Storage",
  },
  {
    id: "interview",
    label: "Preparing for an interview",
    icon: Mic,
    image: "/elora6.jpeg",
    steps: [
      "Review common questions for your visa category",
      "Practise with a realistic AI mock interview",
      "Get structured feedback on clarity and confidence",
      "Refine your answers before the real appointment",
    ],
    tool: "AI Visa Mock Interview",
  },
] as const

export function JourneySelector() {
  const [activeId, setActiveId] = useState<(typeof JOURNEYS)[number]["id"]>(JOURNEYS[0].id)
  const [manuallyPaused, setManuallyPaused] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const active = JOURNEYS.find((j) => j.id === activeId)!

  useEffect(() => {
    if (manuallyPaused || isInteracting) return

    const timer = window.setTimeout(() => {
      setActiveId((currentId) => {
        const currentIndex = JOURNEYS.findIndex((journey) => journey.id === currentId)
        return JOURNEYS[(currentIndex + 1) % JOURNEYS.length].id
      })
    }, AUTOPLAY_DELAY)

    return () => window.clearTimeout(timer)
  }, [activeId, manuallyPaused, isInteracting])

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const forward = e.key === "ArrowRight" || e.key === "ArrowDown"
    const backward = e.key === "ArrowLeft" || e.key === "ArrowUp"
    if (!forward && !backward && e.key !== "Home" && e.key !== "End") return
    e.preventDefault()
    const next = e.key === "Home"
      ? 0
      : e.key === "End"
        ? JOURNEYS.length - 1
        : forward
          ? (index + 1) % JOURNEYS.length
          : (index - 1 + JOURNEYS.length) % JOURNEYS.length
    setActiveId(JOURNEYS[next].id)
    tabRefs.current[next]?.focus()
  }

  const activeIndex = JOURNEYS.findIndex((journey) => journey.id === activeId)

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 dark:bg-slate-950 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-landing-cyan),transparent_30%)] opacity-10" aria-hidden="true" />
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-landing-cyan/25 bg-landing-cyan/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-landing-blue dark:text-landing-cyan">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Your personal starting point
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl">
              Where are you in your <span className="text-landing-blue dark:text-landing-cyan">visa journey?</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg lg:pb-1">
            Choose the situation that feels closest to yours. We&apos;ll shape a clear route from where you are to what comes next.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onFocusCapture={() => setIsInteracting(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false)
          }}
        >
          <div className="grid lg:grid-cols-[20rem_1fr]">
            <div className="border-b border-slate-200 bg-slate-100/70 p-3 dark:border-white/10 dark:bg-white/5 lg:border-b-0 lg:border-r lg:p-4">
              <div
                role="radiogroup"
                aria-label="Your visa journey stage"
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1"
              >
                {JOURNEYS.map((journey, index) => {
                  const selected = activeId === journey.id
                  return (
                    <button
                      key={journey.id}
                      ref={(el) => { tabRefs.current[index] = el }}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveId(journey.id)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={cn(
                        "group flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue focus-visible:ring-offset-2 dark:focus-visible:ring-landing-cyan dark:focus-visible:ring-offset-slate-900",
                        selected
                          ? "border-slate-950 bg-slate-950 text-white shadow-lg dark:border-white dark:bg-white dark:text-slate-950"
                          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
                      )}
                    >
                      <span className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        selected ? "bg-white/15 dark:bg-slate-950/10" : "bg-white text-landing-blue shadow-sm dark:bg-white/10 dark:text-landing-cyan"
                      )}>
                        <journey.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="flex-1 leading-snug">{journey.label}</span>
                      <span className={cn("text-xs tabular-nums", selected ? "text-white/50 dark:text-slate-950/50" : "text-muted-foreground/60")}>
                        0{index + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center gap-3 px-2 text-xs text-muted-foreground">
                <span>{activeIndex + 1} of {JOURNEYS.length}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-landing-cyan to-landing-blue"
                    animate={{ width: `${((activeIndex + 1) / JOURNEYS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setManuallyPaused((paused) => !paused)}
                  aria-label={manuallyPaused ? "Play journey carousel" : "Pause journey carousel"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-landing-cyan"
                >
                  {manuallyPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="min-w-0 bg-slate-950 text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={prefersReducedMotion() ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion() ? { opacity: 1 } : { opacity: 0, y: -12 }}
                  transition={{ duration: prefersReducedMotion() ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid min-h-full lg:grid-cols-[1.05fr_0.95fr]"
                >
                  <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-landing-cyan">Your recommended roadmap</p>
                    <h3 className="mb-7 text-3xl font-bold tracking-tight md:text-4xl">{active.label}</h3>
                    <ol className="space-y-4">
                      {active.steps.map((step, index) => (
                        <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-white/75 md:text-base">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-landing-cyan">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>

                    <div className="mt-8 border-t border-white/10 pt-6">
                      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-landing-cyan/15 text-landing-cyan">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-white/60">Best tool for you</span>
                        <strong className="ml-auto text-right text-white">{active.tool}</strong>
                      </div>
                      <SignupSheet
                        desscription="Build my visa roadmap"
                        className="h-12 w-full rounded-full bg-white px-6 font-semibold text-slate-950 shadow-xl transition-transform hover:scale-[1.01] hover:bg-white/90 sm:w-auto"
                      />
                    </div>
                  </div>

                  <div className="relative min-h-72 overflow-hidden lg:min-h-full">
                    <Image
                      src={active.image}
                      alt={active.label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 36vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent lg:bg-gradient-to-r" />
                    <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/40 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                      Explore your next step
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
