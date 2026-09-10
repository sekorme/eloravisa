"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Shell, Heading, Eyebrow, Body, Caveat, Board } from "../components/Primitives"
import { Cta } from "../components/Cta"
import { Icon, Check, ArrowRight } from "../components/Icon"
import { INTERVIEW } from "../data/content"
import { INTERVIEW_QUESTIONS, DEMO_BEATS } from "../data/interview"
import type { InterviewState } from "../types"
import { gsap, ScrollTrigger, prefersReducedMotion } from "../motion/useMotion"

/**
 * Scene 4 — the AI interview experience.
 *
 * ------------------------------------------------------------------------
 * THE MICROPHONE RULE
 * ------------------------------------------------------------------------
 * This component NEVER calls `navigator.mediaDevices.getUserMedia`, and there
 * is no code path through it that can. The waveform is synthesised from a
 * deterministic function of bar index and elapsed time — it is an illustration
 * of a voice session, not a recording of one.
 *
 * A marketing page that pops a microphone permission prompt while someone is
 * still deciding whether to trust the product has broken that trust before it
 * earned it. The real session at /dashboard/ai-mock-interview asks for the
 * microphone, once, when the applicant deliberately starts it. The notice above
 * the demo says all of this in plain language, visibly.
 *
 * The four states rendered here — connecting, listening, thinking, speaking —
 * are the real states of the live session, so the demo teaches the actual UI.
 */

const AUTO_ADVANCE_MS = 9200

export function InterviewScene() {
    const rootRef = useRef<HTMLElement>(null)
    const timers = useRef<number[]>([])

    const [questionIndex, setQuestionIndex] = useState(0)
    const [state, setState] = useState<InterviewState | "idle">("idle")
    const [caption, setCaption] = useState("Session not started")
    const [beat, setBeat] = useState(-1)
    const [hasRun, setHasRun] = useState(false)

    const question = INTERVIEW_QUESTIONS[questionIndex]

    const clearTimers = useCallback(() => {
        timers.current.forEach((t) => window.clearTimeout(t))
        timers.current = []
    }, [])

    /** Plays the scripted beats. No network, no audio, no microphone. */
    const runDemo = useCallback(
        (advanceQuestion: boolean) => {
            clearTimers()

            if (advanceQuestion) {
                setQuestionIndex((i) => (i + 1) % INTERVIEW_QUESTIONS.length)
            }

            if (prefersReducedMotion()) {
                // Jump to the resolved state. The information is identical; only
                // the theatre is skipped.
                const last = DEMO_BEATS[DEMO_BEATS.length - 1]
                setState(last.state as InterviewState)
                setCaption(last.caption)
                setBeat(DEMO_BEATS.length - 1)
                setHasRun(true)
                return
            }

            setHasRun(true)
            DEMO_BEATS.forEach((b, i) => {
                const t = window.setTimeout(() => {
                    setState(b.state as InterviewState)
                    setCaption(b.caption)
                    setBeat(i)
                }, b.at)
                timers.current.push(t)
            })
        },
        [clearTimers]
    )

    /* Auto-play once when the scene is reached. Visual only — see the note
       above; there is no audio to auto-play and no permission to request. */
    useEffect(() => {
        const el = rootRef.current
        if (!el) return

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: el,
                start: "top 62%",
                once: true,
                onEnter: () => runDemo(false),
            })
        }, el)

        return () => {
            ctx.revert()
            clearTimers()
        }
    }, [runDemo, clearTimers])

    useEffect(() => clearTimers, [clearTimers])

    const feedbackShown = beat >= DEMO_BEATS.length - 1
    const timelineProgress = beat < 0 ? 0 : ((beat + 1) / DEMO_BEATS.length) * 100

    return (
        <section
            ref={rootRef}
            id="interview"
            className="eh-scene eh-interview eh-dark"
            aria-labelledby="eh-interview-title"
            data-state={state}
        >
            <Shell>
                <header className="eh-interview-head">
                    <Eyebrow>{INTERVIEW.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-interview-title">
                        <Heading
                            lines={["Walk into your interview", "already prepared."]}
                            accent="already prepared."
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{INTERVIEW.body}</Body>
                </header>

                <div className="eh-interview-stage">
                    {/* --------------------------------------------- console */}
                    <div className="eh-console">
                        <div className="eh-console-top">
                            <span className="eh-console-state" data-state={state}>
                                <span className="eh-console-dot" aria-hidden="true" />
                                {state === "idle"
                                    ? "Idle"
                                    : INTERVIEW.stateLabels[state]}
                            </span>
                            <Board>Sample session · no microphone used</Board>
                        </div>

                        {/* --- waveform --------------------------------------- */}
                        {/* Purely synthetic: bar heights come from a fixed
                            function of index, so the server and client render
                            identical markup and nothing is ever recorded. */}
                        <div className="eh-wave" data-state={state} aria-hidden="true">
                            {Array.from({ length: 40 }).map((_, i) => (
                                <span
                                    key={i}
                                    style={{
                                        ["--eh-b" as string]: i,
                                        // Deterministic pseudo-noise, stable
                                        // across renders.
                                        ["--eh-h" as string]:
                                            0.22 + ((Math.sin(i * 1.7) + 1) / 2) * 0.78,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Live region so a screen-reader user follows the demo
                            rather than watching silence. */}
                        <p className="eh-console-caption" aria-live="polite">
                            {caption}
                        </p>

                        {/* --- question --------------------------------------- */}
                        <div className="eh-console-question">
                            <span className="eh-console-category">{question.category}</span>
                            <p className="eh-console-prompt">{question.prompt}</p>
                        </div>

                        {/* --- response timeline ------------------------------ */}
                        <div className="eh-console-timeline">
                            <div
                                className="eh-console-timeline-bar"
                                style={{ width: `${timelineProgress}%` }}
                            />
                            <span className="eh-sr">
                                Demo progress: {Math.round(timelineProgress)} percent
                            </span>
                        </div>

                        <div className="eh-console-actions">
                            <button
                                type="button"
                                className="eh-btn eh-btn-secondary"
                                onClick={() => runDemo(hasRun)}
                            >
                                <Icon name="interview" size={16} />
                                {INTERVIEW.sampleCta}
                            </button>
                            <Cta
                                href={INTERVIEW.fullCta.href}
                                variant="ghost"
                                event="sample_interview_started"
                                eventLabel="open_full_interview"
                                scene="interview"
                                trailing={<ArrowRight size={16} />}
                            >
                                {INTERVIEW.fullCta.label}
                            </Cta>
                        </div>
                    </div>

                    {/* -------------------------------------------- feedback */}
                    <aside
                        className="eh-feedback"
                        data-shown={feedbackShown ? "true" : "false"}
                        aria-label="Example session feedback"
                    >
                        <Board>Feedback preview</Board>

                        <div className="eh-feedback-meters">
                            {[
                                { id: "structure", label: "Answer structure", value: 74 },
                                { id: "clarity", label: "Clarity", value: 81 },
                                { id: "consistency", label: "Consistency with your file", value: 66 },
                            ].map((m) => (
                                <div className="eh-meter" key={m.id}>
                                    <div className="eh-meter-top">
                                        <span>{m.label}</span>
                                        {/* Value in text as well as in the bar. */}
                                        <b>{m.value}%</b>
                                    </div>
                                    <div
                                        className="eh-meter-track"
                                        role="meter"
                                        aria-valuenow={m.value}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={m.label}
                                    >
                                        <span
                                            style={{
                                                width: feedbackShown ? `${m.value}%` : "0%",
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="eh-feedback-title">A strong answer here covers</p>
                        <ul className="eh-feedback-list">
                            {question.coaching.map((c) => (
                                <li key={c}>
                                    <Check size={14} />
                                    <span>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>

                <div className="mt-8">
                    <Caveat>{INTERVIEW.micNotice}</Caveat>
                </div>
            </Shell>
        </section>
    )
}
