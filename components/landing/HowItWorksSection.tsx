"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { ArrowRight, Check, ChevronRight, Compass, Gauge, Map, Sparkles, Target } from "lucide-react"
import { JOURNEY_STEPS, PREVIEW_LABEL } from "@/lib/landing/content"
import { JOURNEY_PREVIEWS } from "@/lib/landing/journey-content"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { useLandingMotion } from "./MotionPreferences"
import { Display, Eyebrow, pillClass } from "./ui"
import styles from "./JourneySections.module.css"

const STEP_ICONS = { target: Target, map: Map, sparkles: Sparkles, gauge: Gauge } as const

export function HowItWorksSection() {
  const containerRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const manualSelection = useRef(false)
  const [active, setActive] = useState(0)
  const { enabled } = useLandingMotion()
  const preview = JOURNEY_PREVIEWS[active]

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let cleanup: (() => void) | undefined
    // ScrollTrigger is noncritical; the complete journey renders before it loads.
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return
      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia()
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const ctx = gsap.context(() => {
          gsap.fromTo(lineRef.current, { scaleX: 0 }, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 65%",
              end: "bottom 60%",
              scrub: true,
              onUpdate: (self) => {
                if (!manualSelection.current) setActive(Math.min(3, Math.floor(self.progress * 4)))
              },
              onLeaveBack: () => { manualSelection.current = false },
            },
          })
        }, containerRef)
        return () => ctx.revert()
      })
      cleanup = () => media.revert()
    }).catch(() => { /* The clickable journey remains fully usable if animation fails to load. */ })
    return () => { disposed = true; cleanup?.() }
  }, [enabled])

  function selectStep(index: number, focus = false) {
    manualSelection.current = true
    setActive(index)
    if (focus) tabRefs.current[index]?.focus()
    trackEvent("tool_card_interaction", { label: `journey-step-${index + 1}`, location: "how-it-works" })
  }

  function handleKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % JOURNEY_STEPS.length
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + JOURNEY_STEPS.length - 1) % JOURNEY_STEPS.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = JOURNEY_STEPS.length - 1
    else return
    event.preventDefault()
    selectStep(next, true)
  }

  return (
    <section id="how-it-works" ref={containerRef} aria-labelledby="hiw-heading" className="relative scroll-mt-24 bg-lp-page px-4 py-16 md:px-6 md:py-24">
      <div className={`${styles.journeySurface} mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-lp-line px-5 py-10 sm:px-8 md:rounded-[2.5rem] md:p-12 lg:p-14`}>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-12">
          <div>
            <Eyebrow><Compass className="h-3.5 w-3.5" aria-hidden="true" /> How it works</Eyebrow>
            <Display size="lg" className="mt-5 max-w-3xl text-lp-fg"><span id="hiw-heading">One clear journey from uncertainty to preparation.</span></Display>
          </div>
          <p className="max-w-md text-base leading-relaxed text-lp-muted">Four connected steps. A little more clarity at each one. You stay in control of your application, all the way through.</p>
        </div>

        <div className="relative mt-10 lg:mt-14">
          <div aria-hidden="true" className="absolute left-6 top-6 h-[calc(100%-3rem)] w-px bg-lp-line lg:left-6 lg:right-6 lg:top-6 lg:h-px lg:w-auto">
            <div ref={lineRef} className="hidden h-full w-full origin-left bg-linear-to-r from-lp-azure to-[#D4AF37] lg:block" />
          </div>
          <div role="tablist" aria-label="Explore your preparation journey" className="relative grid gap-5 lg:grid-cols-4 lg:gap-6">
            {JOURNEY_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[step.icon]
              const complete = index < active
              return (
                <button
                  key={step.title}
                  ref={(element) => { tabRefs.current[index] = element }}
                  id={`journey-step-${index}`}
                  role="tab"
                  type="button"
                  aria-selected={index === active}
                  aria-controls="journey-preview"
                  tabIndex={index === active ? 0 : -1}
                  onClick={() => selectStep(index)}
                  onKeyDown={(event) => handleKeys(event, index)}
                  className={`${styles.stepButton} group flex min-h-12 items-start gap-4 lg:block`}
                >
                  <span className={cn(styles.stepNode, "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-lp-card", active === index ? "bg-lp-azure text-white" : complete ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-lp-card-2 text-lp-muted")}>
                    {complete ? <Check className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <span className="block pt-1 lg:pt-5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-lp-muted">Step 0{index + 1}<span className="sr-only">{complete ? ", earlier step in this preview" : ""}</span></span>
                    <span className={cn("mt-1.5 block font-display text-base font-semibold tracking-tight md:text-lg", active === index ? "text-lp-azure" : "text-lp-fg")}>{step.title}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-lp-muted">{step.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div id="journey-preview" role="tabpanel" aria-labelledby={`journey-step-${active}`} tabIndex={0} className="mt-8 grid min-h-[345px] gap-6 rounded-3xl border border-lp-line bg-lp-card p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lp-azure sm:p-7 md:min-h-[290px] md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-10 lg:mt-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-lp-azure"><span className="h-1.5 w-1.5 rounded-full bg-lp-azure" aria-hidden="true" />{PREVIEW_LABEL} · Step 0{active + 1}</span>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-[-0.035em] text-lp-fg md:text-3xl">{preview.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-lp-muted">{preview.note}</p>
          </div>
          <div className="rounded-2xl border border-lp-line bg-lp-card-2/60 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-lp-fg">{preview.label}</p>
              <Sparkles className="h-4 w-4 text-lp-azure" aria-hidden="true" />
            </div>
            {active === 3 && <div className="mb-4"><div className="mb-2 flex items-baseline justify-between gap-3"><span className="text-xs text-lp-muted">Sample preparation score</span><span className="font-display text-xl font-semibold text-lp-azure">82%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-lp-line" aria-hidden="true"><div className="h-full w-[82%] rounded-full bg-linear-to-r from-lp-azure to-[#D4AF37]" /></div></div>}
            <dl className="space-y-2">
              {preview.rows.map((row) => <div key={row.label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-lp-line bg-lp-card px-3 py-2.5"><dt className="flex items-center gap-2 text-xs font-medium text-lp-fg">{active === 1 ? <Check className="h-3.5 w-3.5 text-lp-azure" aria-hidden="true" /> : active === 2 ? <Sparkles className="h-3.5 w-3.5 text-lp-azure" aria-hidden="true" /> : null}{row.label}</dt><dd className="flex items-center gap-2 text-xs text-lp-muted">{row.value}{active === 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}</dd></div>)}
            </dl>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <a href="/signup" className={pillClass("azure", "lg", "h-auto min-h-14 px-5 py-3 text-center")} onClick={() => trackEvent("section_cta_click", { label: "build-preparation-plan", location: "how-it-works" })}>Build My Preparation Plan<ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  )
}
