"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"
import { CheckCircle2, Mic, Radio, Sparkles } from "lucide-react"
import { SignupSheet } from "@/components/auth/SignupSheet"
import { INTERVIEW_SPOTLIGHT, PREVIEW_LABEL } from "@/lib/landing/content"
import { cn } from "@/lib/utils"
import { Display, Eyebrow, pillClass } from "./ui"

type Phase = "idle" | "booting" | "asking" | "listening" | "feedback"

/** How long each phase runs before advancing, in ms. */
const PHASE_MS: Record<Exclude<Phase, "idle" | "asking">, number> = {
  booting: 900,
  listening: 4200,
  feedback: 5200,
}

const TYPE_MS = 34
const BAR_COUNT = 28

/** Deterministic per-bar heights so the waveform doesn't reshuffle on re-render. */
const BAR_SEEDS = Array.from({ length: BAR_COUNT }, (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7)))

function Waveform({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  return (
    <div className="flex h-14 items-center justify-center gap-[3px]" aria-hidden="true">
      {BAR_SEEDS.map((seed, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-linear-to-t from-landing-cyan/70 to-landing-violet"
          initial={false}
          animate={
            active && !reduced
              ? { height: [6, 8 + seed * 40, 10 + seed * 16, 6 + seed * 30, 6] }
              : { height: 6 }
          }
          transition={
            active && !reduced
              ? { duration: 1.1 + seed * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }
              : { duration: 0.3 }
          }
          style={{ height: 6 }}
        />
      ))}
    </div>
  )
}

/** The abstract "voice sphere" standing in for the AI interviewer. */
function VoiceSphere({ speaking }: { speaking: boolean }) {
  const reduced = useReducedMotion()
  return (
    <div className="relative flex h-20 w-20 items-center justify-center" aria-hidden="true">
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-landing-cyan/25",
          speaking && !reduced && "lp-ping-soft"
        )}
      />
      <motion.span
        className="absolute inset-1 rounded-full bg-linear-to-br from-landing-cyan via-landing-blue to-landing-violet blur-[2px]"
        initial={false}
        animate={speaking && !reduced ? { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.85 }}
        transition={{ duration: 2.2, repeat: speaking && !reduced ? Infinity : 0, ease: "easeInOut" }}
      />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur">
        <Mic className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  )
}

/**
 * §12 Mock interview spotlight.
 *
 * A scripted demonstration of the voice interview: the panel powers on, the
 * question types itself out, the waveform reacts, then feedback categories
 * appear. The whole loop is gated on `useInView` so no timers or animation
 * frames run while the section is off-screen (§25), and under reduced motion it
 * renders the final state immediately with no cycling.
 */
export function MockInterviewSpotlight() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { amount: 0.35 })
  const reduced = useReducedMotion()

  const [phase, setPhase] = useState<Phase>("idle")
  const [typed, setTyped] = useState(0)
  const [seconds, setSeconds] = useState(0)

  const question = INTERVIEW_SPOTLIGHT.question

  // Reduced motion: skip the performance and show the informative end state.
  useEffect(() => {
    if (!reduced) return
    setPhase("feedback")
    setTyped(question.length)
    setSeconds(38)
  }, [reduced, question.length])

  // Drive the phase machine, but only while visible.
  useEffect(() => {
    if (reduced) return
    if (!inView) {
      setPhase("idle")
      return
    }
    if (phase === "idle") {
      setTyped(0)
      setSeconds(0)
      const t = setTimeout(() => setPhase("booting"), 220)
      return () => clearTimeout(t)
    }
    if (phase === "asking") return // advanced by the typing effect below

    const next: Record<"booting" | "listening" | "feedback", Phase> = {
      booting: "asking",
      listening: "feedback",
      feedback: "idle",
    }
    const key = phase as "booting" | "listening" | "feedback"
    const t = setTimeout(() => setPhase(next[key]), PHASE_MS[key])
    return () => clearTimeout(t)
  }, [phase, inView, reduced])

  // Type the question out one character at a time.
  useEffect(() => {
    if (reduced || phase !== "asking") return
    if (typed >= question.length) {
      const t = setTimeout(() => setPhase("listening"), 550)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setTyped((n) => n + 1), TYPE_MS)
    return () => clearTimeout(t)
  }, [phase, typed, question.length, reduced])

  // Response timer, running only while the applicant would be answering.
  useEffect(() => {
    if (reduced || phase !== "listening") return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [phase, reduced])

  const status = useMemo(() => {
    switch (phase) {
      case "idle":
      case "booting":
        return { label: "Connecting", tone: "text-white/60" }
      case "asking":
        return { label: "Speaking", tone: "text-landing-cyan" }
      case "listening":
        return { label: "Listening", tone: "text-emerald-400" }
      case "feedback":
        return { label: "Reviewing your answer", tone: "text-landing-violet" }
    }
  }, [phase])

  const powered = phase !== "idle"
  const progress = phase === "feedback" ? 1 : phase === "listening" ? 0.66 : phase === "asking" ? 0.33 : 0.08

  return (
    <section
      id="mock-interview"
      ref={sectionRef}
      aria-labelledby="interview-heading"
      className="relative scroll-mt-24 overflow-hidden bg-landing-navy px-3 py-16 text-white md:px-5 md:py-24"
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-lp-azure/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-landing-violet/20 blur-3xl" aria-hidden="true" />

      <div className="container relative mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div>
            <Eyebrow tone="dark">
              <Mic className="h-3 w-3" aria-hidden="true" />
              AI Mock Interview
            </Eyebrow>
            <Display as="h2" size="lg" className="mt-6">
              <span id="interview-heading">{INTERVIEW_SPOTLIGHT.headline}</span>
            </Display>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
              {INTERVIEW_SPOTLIGHT.supporting}
            </p>

            <ul className="mt-8 space-y-3">
              {INTERVIEW_SPOTLIGHT.feedback.map((f) => (
                <li key={f.label} className="flex items-start gap-3 text-sm text-white/70">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-landing-cyan" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-white">{f.label}.</strong> {f.note}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <SignupSheet
                desscription={INTERVIEW_SPOTLIGHT.cta}
                className={pillClass("white", "lg", "w-full sm:w-auto")}
              />
            </div>
          </div>

          {/* Demonstration panel */}
          <div className="relative">
            <div
              className={cn(
                "relative overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/70 p-5 backdrop-blur-xl transition-opacity duration-700 md:p-7",
                powered ? "opacity-100" : "opacity-60"
              )}
            >
              {/* Panel chrome */}
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
                  <Radio className="h-3 w-3 text-landing-cyan" aria-hidden="true" />
                  {PREVIEW_LABEL} · demonstration
                </span>
                <span className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", status.tone)}>
                  {status.label}
                </span>
              </div>

              {/* Interviewer + question */}
              <div className="flex items-start gap-4">
                <VoiceSphere speaking={phase === "asking"} />
                <div className="min-w-0 flex-1 pt-2">
                  <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                    Interviewer
                  </span>
                  {/* aria-live so screen-reader users hear the question once it
                      settles, without narrating every keystroke. */}
                  <p
                    className="mt-2 min-h-[3.5rem] font-display text-base font-medium leading-snug text-white md:text-lg"
                    aria-live="polite"
                  >
                    {question.slice(0, typed)}
                    {!reduced && phase === "asking" && (
                      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-landing-cyan align-middle" />
                    )}
                  </p>
                </div>
              </div>

              {/* Waveform + timer */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/4 p-4">
                <Waveform active={phase === "listening" || phase === "asking"} />
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/55">
                  <span>Your response</span>
                  <span className="font-mono tabular-nums">
                    {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Session progress */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
                  <span>Session progress</span>
                  <span>Question 3 of 8</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-landing-cyan to-landing-violet"
                    initial={false}
                    animate={{ scaleX: progress }}
                    style={{ transformOrigin: "left" }}
                    transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Feedback preview */}
              <div className="mt-5 min-h-[6.5rem]">
                <AnimatePresence>
                  {phase === "feedback" && (
                    <motion.div
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-2xl border border-white/10 bg-white/6 p-4"
                    >
                      <p className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                        <Sparkles className="h-3 w-3 text-landing-cyan" aria-hidden="true" />
                        Sample end-of-session feedback
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-3">
                        {INTERVIEW_SPOTLIGHT.feedback.map((f, i) => (
                          <motion.li
                            key={f.label}
                            initial={reduced ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reduced ? 0 : 0.12 * i, duration: 0.4 }}
                            className="rounded-xl bg-slate-950/50 px-3 py-2"
                          >
                            <span className="block text-[10px] uppercase tracking-widest text-white/45">{f.label}</span>
                            <span className="mt-0.5 block text-xs font-semibold text-white">Reviewed</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-white/40">
              Illustrative walkthrough using sample content. Your own session uses questions matched to your destination
              and visa category.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
