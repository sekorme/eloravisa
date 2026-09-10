"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Check, UserPlus, RotateCcw, GraduationCap, Briefcase, Mic, Pause, Play } from "lucide-react"
import { SignupSheet } from "@/components/auth/SignupSheet"
import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/motion"
import { Display, Eyebrow, Reveal, pillClass } from "./ui"

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
    <section className="relative bg-lp-page py-16 md:py-24">
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal className="max-w-3xl">
            <Eyebrow>Your personal starting point</Eyebrow>
            <Display size="lg" className="mt-5 text-lp-fg">
              Where are you in your <span className="text-lp-azure">visa journey?</span>
            </Display>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-sm leading-relaxed text-lp-muted md:text-base lg:pb-1">
              Choose the situation that feels closest to yours. We&apos;ll shape a clear route from where you are to
              what comes next.
            </p>
          </Reveal>
        </div>

        <Reveal scale y={40} amount={0.15}>
          <div
            className="overflow-hidden rounded-[2rem] border border-lp-line bg-lp-card lp-shadow"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onFocusCapture={() => setIsInteracting(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false)
            }}
          >
            <div className="grid lg:grid-cols-[20rem_1fr]">
              <div className="border-b border-lp-line bg-lp-card-2 p-3 lg:border-b-0 lg:border-r lg:p-4">
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
                          "group flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 focus-visible:ring-offset-lp-card-2",
                          selected
                            ? "border-lp-navy bg-lp-navy text-white shadow-lg"
                            : "border-transparent text-lp-fg/75 hover:border-lp-line hover:bg-lp-card hover:text-lp-fg"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                            selected ? "bg-white/15 text-white" : "bg-lp-card text-lp-azure shadow-sm"
                          )}
                        >
                          <journey.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="flex-1 leading-snug">{journey.label}</span>
                        <span className={cn("font-display text-[10px] tabular-nums", selected ? "text-white/50" : "text-lp-muted/70")}>
                          0{index + 1}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center gap-3 px-2 text-xs text-lp-muted">
                  <span className="font-display text-[10px] tracking-widest">{activeIndex + 1} / {JOURNEYS.length}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-lp-line">
                    <motion.div
                      className="h-full rounded-full bg-lp-azure"
                      animate={{ width: `${((activeIndex + 1) / JOURNEYS.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setManuallyPaused((paused) => !paused)}
                    aria-label={manuallyPaused ? "Play journey carousel" : "Pause journey carousel"}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lp-line bg-lp-card text-lp-fg transition-colors hover:bg-lp-sky-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
                  >
                    {manuallyPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="min-w-0 bg-lp-navy text-white">
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
                      <p className="mb-4 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                        Your recommended roadmap
                      </p>
                      <Display as="h3" size="sm" className="mb-7">
                        {active.label}
                      </Display>
                      <ol className="space-y-4">
                        {active.steps.map((step, index) => (
                          <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-white/75 md:text-base">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 font-display text-[10px] font-semibold text-white">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>

                      <div className="mt-8 border-t border-white/10 pt-6">
                        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-sm">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lp-azure text-white">
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="text-white/60">Best tool for you</span>
                          <strong className="ml-auto text-right text-white">{active.tool}</strong>
                        </div>
                        <SignupSheet
                          desscription="Build my visa roadmap"
                          className={pillClass("white", "md", "w-full sm:w-auto")}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-lp-navy via-lp-navy/10 to-transparent lg:bg-gradient-to-r" />
                      <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full border border-white/20 bg-lp-navy/50 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                        Explore your next step
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
