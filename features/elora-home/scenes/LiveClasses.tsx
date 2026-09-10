"use client"

import { useId, useState } from "react"
import { Shell, Heading, Eyebrow, Body, Board } from "../components/Primitives"
import { Cta } from "../components/Cta"
import { Icon, ArrowRight, Check } from "../components/Icon"
import Image from "next/image"
import { CLASSES } from "../data/content"
import { CLASSES_IMAGE } from "../data/media"
import type { LiveClass } from "../adapters/proof"
import { joinClassWaitlist } from "@/action/emailLists"
import { track } from "../adapters/analytics"

/**
 * Scene 7 — expert-led live classes.
 *
 * ------------------------------------------------------------------------
 * WHY THERE IS NO SCHEDULE HERE
 * ------------------------------------------------------------------------
 * The brief asked for an upcoming-class card with an instructor, a date, a
 * timezone, a live indicator and seat availability. This product has no class
 * scheduling backend — `action/emailLists.ts` says so in as many words, and the
 * `joinClassWaitlist` action exists precisely because dates don't exist yet.
 *
 * Rendering "Thursday 19:00 GMT · Kwame A. · 12 seats left" would mean
 * inventing an instructor, a time and a scarcity signal, and scarcity is the
 * one to be most careful with: a fake "12 seats left" is a manipulation, not a
 * placeholder.
 *
 * So the scene ships in its waitlist state, with the broadcast art direction
 * intact and the honest message that dates aren't set. The moment
 * `getUpcomingClasses()` returns real sessions, this component renders them —
 * that code path is written and live below, not a TODO.
 */

interface LiveClassesProps {
    classes: LiveClass[]
}

type FormState =
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "error"; message: string }
    | { status: "success"; message: string }

export function LiveClasses({ classes }: LiveClassesProps) {
    const [email, setEmail] = useState("")
    const [form, setForm] = useState<FormState>({ status: "idle" })
    const inputId = useId()
    const statusId = useId()

    const hasSchedule = classes.length > 0

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (form.status === "submitting") return

        setForm({ status: "submitting" })

        try {
            const result = await joinClassWaitlist(email)
            if (result.ok) {
                setForm({ status: "success", message: result.message })
                setEmail("")
                // Note the analytics label is a fixed slug — the email address
                // is never passed to analytics.
                track("live_class_waitlist_joined", {
                    label: "class_waitlist",
                    scene: "classes",
                })
            } else {
                setForm({ status: "error", message: result.message })
            }
        } catch {
            setForm({
                status: "error",
                message: "We couldn't reach the server. Please try again shortly.",
            })
        }
    }

    return (
        <section
            id="live-classes"
            className="eh-scene eh-classes"
            aria-labelledby="eh-classes-title"
        >
            <Shell>
                <div className="eh-classes-grid">
                    <header className="eh-classes-head">
                        <Eyebrow>{CLASSES.eyebrow}</Eyebrow>
                        <div className="mt-4" id="eh-classes-title">
                            <Heading
                                lines={["Learn the process from", "people who have taught it."]}
                                size="md"
                            />
                        </div>
                        <Body className="mt-6">{CLASSES.body}</Body>

                        {hasSchedule ? (
                            <Cta
                                href={CLASSES.scheduleCta.href}
                                variant="secondary"
                                event="live_class_waitlist_joined"
                                eventLabel="view_schedule"
                                scene="classes"
                                className="mt-8"
                                trailing={<ArrowRight size={16} />}
                            >
                                {CLASSES.scheduleCta.label}
                            </Cta>
                        ) : null}
                    </header>

                    {/* ------------------------------------------- broadcast */}
                    {/* `eh-dark`: this card is a dark surface sitting on a white
                        page. Without the scope its heading and body inherit the
                        light-surface foreground and render dark-on-dark. */}
                    <div className="eh-broadcast eh-dark">
                        {/* Streaming-inspired chrome. The "live" indicator only
                            appears when something is genuinely live. */}
                        <div className="eh-broadcast-top">
                            <Board>Elora live · classroom</Board>
                            {hasSchedule && classes.some((c) => c.isLive) ? (
                                <span className="eh-broadcast-live">
                                    <span className="eh-live-dot" aria-hidden="true" />
                                    Live now
                                </span>
                            ) : (
                                <span className="eh-broadcast-off">Off air</span>
                            )}
                        </div>

                        <div className="eh-broadcast-screen">
                            {/* The room this is about. Sits behind the panel
                                content at low opacity under a navy-green wash,
                                so it reads as atmosphere and the copy on top
                                keeps full contrast. */}
                            <Image
                                src={CLASSES_IMAGE.src}
                                alt={CLASSES_IMAGE.alt}
                                fill
                                sizes="(max-width: 1020px) 100vw, 55vw"
                                className="eh-broadcast-photo"
                            />
                            {/* Moving light across the "stage". Slow, low
                                opacity, transform-only. */}
                            <span className="eh-broadcast-sweep" aria-hidden="true" />
                            <span className="eh-broadcast-grid eh-coordgrid" aria-hidden="true" />

                            <div className="eh-broadcast-content">
                                <Icon name="classes" size={30} />

                                {hasSchedule ? (
                                    <ul className="eh-class-list">
                                        {classes.map((c) => (
                                            <li key={c.id}>
                                                <p className="eh-class-topic">{c.topic}</p>
                                                <p className="eh-class-meta">
                                                    {c.instructor} ·{" "}
                                                    {new Intl.DateTimeFormat("en-GB", {
                                                        weekday: "short",
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        timeZone: c.timezone,
                                                    }).format(new Date(c.startsAt))}{" "}
                                                    ({c.timezone})
                                                </p>
                                                {/* Availability renders only when
                                                    the backend actually supplies
                                                    a number. */}
                                                {typeof c.seatsRemaining === "number" ? (
                                                    <p className="eh-class-seats">
                                                        {c.seatsRemaining} places remaining
                                                    </p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <>
                                        <h3 className="eh-broadcast-title">
                                            {CLASSES.waitlist.title}
                                        </h3>
                                        <p className="eh-broadcast-body">
                                            {CLASSES.waitlist.body}
                                        </p>

                                        <form className="eh-waitlist" onSubmit={onSubmit} noValidate>
                                            <label htmlFor={inputId} className="eh-sr">
                                                Email address for class updates
                                            </label>
                                            <input
                                                id={inputId}
                                                type="email"
                                                name="email"
                                                inputMode="email"
                                                autoComplete="email"
                                                required
                                                placeholder={CLASSES.waitlist.placeholder}
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    if (form.status !== "idle") {
                                                        setForm({ status: "idle" })
                                                    }
                                                }}
                                                aria-describedby={statusId}
                                                aria-invalid={form.status === "error"}
                                                disabled={form.status === "submitting"}
                                            />
                                            <button
                                                type="submit"
                                                className="eh-btn eh-btn-primary"
                                                disabled={form.status === "submitting"}
                                            >
                                                {form.status === "submitting"
                                                    ? "Adding…"
                                                    : CLASSES.waitlist.cta}
                                            </button>
                                        </form>

                                        {/* One live region carries loading,
                                            error and success, so assistive tech
                                            hears every outcome. */}
                                        <p
                                            id={statusId}
                                            className="eh-waitlist-status"
                                            data-status={form.status}
                                            role="status"
                                            aria-live="polite"
                                        >
                                            {form.status === "submitting"
                                                ? "Adding you to the list…"
                                                : form.status === "error"
                                                  ? form.message
                                                  : form.status === "success"
                                                    ? form.message
                                                    : ""}
                                        </p>

                                        {form.status === "success" ? (
                                            <p className="eh-waitlist-done" aria-hidden="true">
                                                <Check size={14} /> You&rsquo;re on the list
                                            </p>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Shell>
        </section>
    )
}
