"use client"

import { useState } from "react"
import { BadgeCheck, ChevronDown, Eye, Flag, MessagesSquare, XCircle, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Consular-specific parts of a saved interview session (schemaVersion 2,
// written by action/interviewSessions.ts). Every section is optional so
// older sessions without these fields simply render less.

export interface SessionQuestion {
  question: string
  answer: string
  rating: number
  issue?: string
  betterAnswer?: string
}

export interface SessionFeedbackV2 {
  decision?: "approved" | "refused" | "undecided"
  decisionReason?: string
  intentScore?: number
  financialScore?: number
  tiesScore?: number
  purposeScore?: number
  redFlags?: string[]
  behaviorNotes?: string[]
  questions?: SessionQuestion[]
}

export interface SessionTurn {
  role: "user" | "model"
  text: string
}

const LABEL = "font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted"

export function DecisionBadge({ decision, className }: { decision?: string; className?: string }) {
  if (decision !== "approved" && decision !== "refused") return null
  const approved = decision === "approved"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[10px] font-medium uppercase tracking-[0.14em]",
        approved ? "bg-lp-sky text-lp-azure" : "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
        className
      )}
    >
      {approved ? <BadgeCheck className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {approved ? "Approved" : "Refused"}
    </span>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-lp-fg/85">{label}</span>
        <span className="font-display font-semibold">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-lp-sky">
        <div
          className={cn("h-full rounded-full", value >= 70 ? "bg-lp-azure" : value >= 40 ? "bg-amber-500" : "bg-red-500")}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}

export function SessionInsights({ feedback, transcript }: { feedback?: SessionFeedbackV2 | null; transcript?: SessionTurn[] }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const fb = feedback || {}
  const dims = [
    { label: "Intent to return", value: fb.intentScore },
    { label: "Financial credibility", value: fb.financialScore },
    { label: "Ties to home country", value: fb.tiesScore },
    { label: "Purpose of travel", value: fb.purposeScore },
  ].filter((d): d is { label: string; value: number } => typeof d.value === "number")
  const turns = (transcript || []).filter((t) => t?.text)

  return (
    <div className="space-y-5">
      {(fb.decision === "approved" || fb.decision === "refused" || fb.decision === "undecided") && (
        <div
          className={cn(
            "flex items-start gap-4 rounded-2xl p-5",
            fb.decision === "approved" && "bg-lp-navy text-white",
            fb.decision === "refused" && "border border-red-200 bg-red-50 text-red-900 dark:border-red-400/20 dark:bg-red-400/[0.06] dark:text-red-100",
            fb.decision === "undecided" && "border border-lp-line bg-lp-card-2 text-lp-fg"
          )}
        >
          <span className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            fb.decision === "approved" ? "bg-white/10 text-[#8FCDAF]" : fb.decision === "refused" ? "bg-red-100 text-red-600 dark:bg-red-400/10 dark:text-red-300" : "bg-lp-sky text-lp-azure"
          )}>
            {fb.decision === "approved" ? <BadgeCheck className="h-5 w-5" /> : fb.decision === "refused" ? <XCircle className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
          </span>
          <div>
            <p className={cn("font-display text-[10px] font-medium uppercase tracking-[0.18em]", fb.decision === "approved" ? "text-white/60" : "opacity-70")}>
              Officer&apos;s decision
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold tracking-[-0.02em]">
              {fb.decision === "approved" ? "Visa approved" : fb.decision === "refused" ? "Visa refused" : "No decision given"}
            </p>
            {fb.decisionReason && <p className={cn("mt-1 text-sm leading-relaxed", fb.decision === "approved" ? "text-white/75" : "opacity-85")}>{fb.decisionReason}</p>}
          </div>
        </div>
      )}

      {dims.length > 0 && (
        <div className="rounded-2xl border border-lp-line bg-lp-card p-5">
          <p className={cn(LABEL, "mb-4")}>What the officer weighs</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {dims.map((d) => <ScoreBar key={d.label} {...d} />)}
          </div>
        </div>
      )}

      {((fb.redFlags?.length ?? 0) > 0 || (fb.behaviorNotes?.length ?? 0) > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {(fb.redFlags?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-400/20 dark:bg-red-400/[0.06]">
              <p className="mb-3 flex items-center gap-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-red-700 dark:text-red-300">
                <Flag className="h-3.5 w-3.5" /> Red flags
              </p>
              <ul className="space-y-2 text-sm text-red-900/85 dark:text-red-100/85">
                {fb.redFlags!.map((f, i) => <li key={i} className="leading-snug">{f}</li>)}
              </ul>
            </div>
          )}
          {(fb.behaviorNotes?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-lp-line bg-lp-card-2 p-5">
              <p className={cn(LABEL, "mb-3 flex items-center gap-2")}>
                <Eye className="h-3.5 w-3.5" /> Officer observations
              </p>
              <ul className="space-y-2 text-sm text-lp-fg/85">
                {fb.behaviorNotes!.map((n, i) => <li key={i} className="leading-snug">{n}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {(fb.questions?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-lp-line bg-lp-card p-5">
          <p className={cn(LABEL, "mb-4")}>Question by question</p>
          <ol className="space-y-3">
            {fb.questions!.map((q, i) => (
              <li key={i} className="rounded-xl border border-lp-line bg-lp-card-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-sm font-semibold leading-snug tracking-[-0.01em]">
                    <span className="mr-2 text-lp-muted">{String(i + 1).padStart(2, "0")}</span>{q.question}
                  </p>
                  <span className="flex shrink-0 gap-0.5" aria-label={`Rated ${q.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={cn("h-1.5 w-3 rounded-full", n <= q.rating ? (q.rating >= 4 ? "bg-lp-azure" : q.rating === 3 ? "bg-amber-500" : "bg-red-500") : "bg-lp-sky")} />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-lp-muted"><span className="font-semibold text-lp-fg/80">You: </span>{q.answer}</p>
                {q.issue && <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{q.issue}</p>}
                {q.betterAnswer && (
                  <p className="mt-3 rounded-lg bg-lp-sky p-3 text-sm text-lp-fg/90">
                    <span className="mb-1 block font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-azure">Stronger answer</span>
                    {q.betterAnswer}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {turns.length > 0 && (
        <div className="rounded-2xl border border-lp-line bg-lp-card">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            className="flex w-full items-center justify-between gap-3 rounded-2xl p-5 text-left transition-colors hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lp-azure"
          >
            <span className={cn(LABEL, "flex items-center gap-2")}>
              <MessagesSquare className="h-3.5 w-3.5" /> Full transcript · {turns.length} turns
            </span>
            <ChevronDown className={cn("h-4 w-4 text-lp-muted transition-transform", showTranscript && "rotate-180")} />
          </button>
          {showTranscript && (
            <div className="max-h-[420px] space-y-3 overflow-y-auto border-t border-lp-line p-5">
              {turns.map((t, i) => (
                <div key={i} className={cn("flex flex-col gap-1", t.role === "user" ? "items-end" : "items-start")}>
                  <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">
                    {t.role === "user" ? "You" : "Officer"}
                  </span>
                  <p className={cn(
                    "max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    t.role === "user" ? "rounded-tr-md bg-lp-navy text-white" : "rounded-tl-md border border-lp-line bg-lp-card-2 text-lp-fg"
                  )}>
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
