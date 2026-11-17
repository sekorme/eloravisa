import type { CSSProperties } from "react"

/**
 * A small, illustrated preview of how Elora helps each applicant situation,
 * shown over the open panel in "Who is this for?".
 *
 * ------------------------------------------------------------------------
 * HONESTY RULES (same as data/audiences.ts)
 * ------------------------------------------------------------------------
 * Every preview is labelled "Example" and shows only things the product
 * actually does. In particular, "Past refusals" does NOT show a refusal
 * letter being analysed — there is no such feature. It shows the real one:
 * reviewing a file against the areas refusals commonly turn on, and
 * declaring a previous refusal properly.
 *
 * ------------------------------------------------------------------------
 * HOW IT ANIMATES
 * ------------------------------------------------------------------------
 * Pure CSS. Each step's keyframes run only while the panel is open
 * (`.eh-aud-panel[data-active="true"]`), so the sequence replays every time
 * a panel opens — hover/focus on desktop, swiping to the card on phones.
 * `--d` staggers the steps. The final state is the base style, so with
 * reduced motion (animations off) the preview is simply shown complete.
 *
 * Decorative (`aria-hidden`): the panel's own copy says the same in words.
 * Built from spans because it lives inside the panel's <button>.
 */

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties

function Shell({ kicker, children }: { kicker: string; children: React.ReactNode }) {
    return (
        <span className="eh-prev" aria-hidden="true">
            <span className="eh-prev-head">
                <span className="eh-prev-kicker">{kicker}</span>
                <span className="eh-prev-tag">Example</span>
            </span>
            {children}
        </span>
    )
}

function Tick() {
    return (
        <svg viewBox="0 0 12 12" fill="none">
            <path d="m2.5 6.3 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

/* 01 — First-time applicants: a roadmap that ticks itself off. */
function Roadmap() {
    const steps: [string, "done" | "now" | "next"][] = [
        ["Route chosen", "done"],
        ["Documents gathered", "done"],
        ["File reviewed", "done"],
        ["Interview practice", "now"],
        ["Ready to submit", "next"],
    ]
    return (
        <Shell kicker="Your roadmap">
            <span className="eh-prev-list">
                {steps.map(([label, state], i) => (
                    <span key={label} className="eh-prev-row" data-state={state} style={d(450 + i * 260)}>
                        <span className="eh-prev-mark">{state === "done" && <Tick />}</span>
                        <span className="eh-prev-label">{label}</span>
                        {state === "now" && <span className="eh-prev-status">In progress</span>}
                    </span>
                ))}
            </span>
            <span className="eh-prev-bar">
                <span className="eh-prev-bar-fill" style={{ ...d(450), "--to": "68%" } as CSSProperties} />
            </span>
        </Shell>
    )
}

/* 02 — Past refusals: a reapplication review resolving item by item. */
function Reapply() {
    const rows: [string, string][] = [
        ["Evidence gaps", "Addressed"],
        ["Dates consistent", "Fixed"],
        ["Ties to home", "Strengthened"],
        ["Past refusal declared", "Yes"],
    ]
    return (
        <Shell kicker="Reapplication review">
            <span className="eh-prev-scan" />
            <span className="eh-prev-list">
                {rows.map(([label, result], i) => (
                    <span key={label} className="eh-prev-row eh-prev-row--check" style={d(500 + i * 420)}>
                        <span className="eh-prev-mark">
                            <Tick />
                        </span>
                        <span className="eh-prev-label">{label}</span>
                        <span className="eh-prev-swap">
                            <span className="eh-prev-swap-old">Checking…</span>
                            <span className="eh-prev-swap-new">{result}</span>
                        </span>
                    </span>
                ))}
            </span>
        </Shell>
    )
}

/* 03 — Students & workers: guidance that changes with the route. */
function RouteSwitch() {
    const study = ["Admission letter", "Proof of funds", "Statement of purpose"]
    const work = ["Job offer", "Employer sponsorship", "Qualifications"]
    return (
        <Shell kicker="Tailored to your route">
            <span className="eh-prev-toggle" style={d(1500)}>
                <span className="eh-prev-toggle-thumb" />
                <span className="eh-prev-toggle-opt eh-prev-toggle-a">Study</span>
                <span className="eh-prev-toggle-opt eh-prev-toggle-b">Work</span>
            </span>
            <span className="eh-prev-docs">
                <span className="eh-prev-docset eh-prev-docset--a" style={d(1500)}>
                    {study.map((doc, i) => (
                        <span key={doc} className="eh-prev-doc" style={d(350 + i * 140)}>
                            {doc}
                        </span>
                    ))}
                </span>
                <span className="eh-prev-docset eh-prev-docset--b" style={d(1500)}>
                    {work.map((doc, i) => (
                        <span key={doc} className="eh-prev-doc" style={d(1700 + i * 140)}>
                            {doc}
                        </span>
                    ))}
                </span>
            </span>
        </Shell>
    )
}

/* 04 — Tired of agents: the agent experience, struck out and replaced. */
function Control() {
    const rows: [string, string][] = [
        ["Hidden fees", "Price shown before you pay"],
        ["Agent holds your documents", "Your documents, your account"],
        ["Updates when they call", "Every step visible to you"],
    ]
    return (
        <Shell kicker="You stay in control">
            <span className="eh-prev-list">
                {rows.map(([before, after], i) => (
                    <span key={before} className="eh-prev-row eh-prev-row--swap" style={d(500 + i * 520)}>
                        <span className="eh-prev-mark">
                            <Tick />
                        </span>
                        <span className="eh-prev-swap eh-prev-swap--line">
                            <span className="eh-prev-swap-old">{before}</span>
                            <span className="eh-prev-swap-new">{after}</span>
                        </span>
                    </span>
                ))}
            </span>
        </Shell>
    )
}

const PREVIEWS: Record<string, () => React.JSX.Element> = {
    "first-time": Roadmap,
    "past-refusals": Reapply,
    "students-workers": RouteSwitch,
    "tired-of-agents": Control,
}

export function AudiencePreview({ id }: { id: string }) {
    const Preview = PREVIEWS[id]
    return Preview ? <Preview /> : null
}
