"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, CalendarClock, CalendarPlus, CheckCircle2, Gauge, Mic, PenLine, RefreshCw, ShieldAlert, Sparkles, Upload, type LucideIcon } from "lucide-react"
import { useReadiness } from "@/hooks/useReadiness"
import { plainText } from "@/lib/reviewIssues"
import { dashCard } from "@/components/dashboard/dashboardStyles"
import { Sparkline, useReadinessHistory } from "@/components/dashboard/delight/useReadinessHistory"

/**
 * Segmented score ring: one arc per part, each as long as that part's weight
 * in the score (same weights as lib/visaReadiness.ts) and filled by its
 * progress. The centre shows the real score, which also includes penalties
 * for expired documents.
 */
const PARTS = [
  { key: "documents", label: "Documents", weight: 0.35, stroke: "text-emerald-500", dot: "bg-emerald-500" },
  { key: "review", label: "AI review", weight: 0.35, stroke: "text-sky-500", dot: "bg-sky-500" },
  { key: "interview", label: "Interview", weight: 0.3, stroke: "text-violet-500", dot: "bg-violet-500" },
] as const

function SegmentedRing({ score, parts }: { score: number; parts: Record<(typeof PARTS)[number]["key"], number> }) {
  const r = 46
  const c = 2 * Math.PI * r
  const gap = 4
  // Where each arc starts: the sum of the weights before it.
  const starts = PARTS.map((_, i) => PARTS.slice(0, i).reduce((sum, p) => sum + c * p.weight, 0))
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90" aria-hidden="true">
        {PARTS.map((p, i) => {
          const len = c * p.weight - gap
          const fill = Math.max(0, len * Math.min(100, parts[p.key]) / 100)
          const offset = -starts[i]
          return (
            <g key={p.key} className={p.stroke}>
              <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="9" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={offset} />
              <circle cx="55" cy="55" r={r} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${fill} ${c - fill}`} strokeDashoffset={offset} className="transition-[stroke-dasharray] duration-1000" />
            </g>
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display text-3xl font-semibold tracking-[-0.04em] ${scoreTone(score)}`}>{score}</span>
        <span className="text-[10px] text-lp-muted">out of 100</span>
      </div>
    </div>
  )
}

/** An icon per kind of next step, from its id prefix. */
const STEP_ICONS: [prefix: string, icon: LucideIcon, tone: string][] = [
  ["renew-", RefreshCw, "bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-300"],
  ["upload-", Upload, "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"],
  ["review-", Sparkles, "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"],
  ["improve-", PenLine, "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"],
  ["interview-", Mic, "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"],
  ["check-", ShieldAlert, "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"],
  ["add-appointment", CalendarPlus, "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300"],
]
const stepIcon = (id: string) => STEP_ICONS.find(([p]) => id.startsWith(p)) ?? ["", ArrowRight, "bg-lp-sky text-lp-azure"] as const

const scoreTone = (score: number) =>
  score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600"

function daysUntil(ms: number, now: number) {
  return Math.ceil((ms - now) / (24 * 60 * 60 * 1000))
}

/**
 * Readiness score, what to fix next, documents that won't be valid in time,
 * and the appointment countdown. Used on the dashboard and appointment page.
 */
export function ReadinessPanel({ maxSteps = 4, showAppointment = true }: { maxSteps?: number; showAppointment?: boolean }) {
  const { readiness, appointment, loading, now } = useReadiness()
  const trend = useReadinessHistory()

  if (loading) return <div className="h-64 animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2" />

  const problems = readiness.validity.filter((v) => v.status !== "ok")
  const steps = readiness.nextSteps.slice(0, maxSteps)
  const days = appointment ? daysUntil(appointment.atMs, now) : null

  return (
    <div className={`space-y-5 p-5 md:p-6 ${dashCard}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lp-muted">
          <Gauge className="h-4 w-4 text-lp-azure" /> Interview readiness
        </span>
        {showAppointment && appointment && days !== null && days >= 0 && (
          <Link href="/dashboard/appointment" className="rounded-2xl bg-lp-sky px-4 py-2 text-right">
            <span className="block font-display text-2xl font-semibold text-lp-azure">{days === 0 ? "Today" : days}</span>
            <span className="text-xs text-lp-muted">{days === 0 ? "embassy appointment" : `day${days === 1 ? "" : "s"} to your appointment`}</span>
          </Link>
        )}
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <SegmentedRing score={readiness.score} parts={readiness.parts} />
        <div className="w-full flex-1 space-y-3">
          {PARTS.map((p) => {
            const hint = p.key === "documents" ? `${readiness.uploadedRequired} uploaded` : p.key === "review" ? `${readiness.reviewedRequired} reviewed` : "last 3 sessions"
            return (
              <div key={p.key}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium"><span className={`h-2.5 w-2.5 rounded-full ${p.dot}`} aria-hidden="true" />{p.label}</span>
                  <span className="tabular-nums"><strong>{readiness.parts[p.key]}</strong><span className="text-lp-muted"> · {hint}</span></span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-lp-sky" aria-hidden="true">
                  <div className={`h-full rounded-full ${p.dot} transition-[width] duration-1000`} style={{ width: `${readiness.parts[p.key]}%` }} />
                </div>
              </div>
            )
          })}
          {/* Trend from daily snapshots; appears from the second day. */}
          {trend.hasTrend && (
            <div className="flex items-center gap-2 pt-1">
              <Sparkline points={trend.points} className="h-7 w-24 text-lp-azure" />
              {trend.change !== 0 && (
                <span className={`text-xs font-semibold ${trend.change > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {trend.change > 0 ? "+" : ""}{trend.change} this week
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {problems.length > 0 && (
        <div className="space-y-2">
          {problems.map((p) => (
            <div key={p.key} className={`flex gap-2 rounded-xl p-3 text-sm ${p.status === "expired" || p.status === "expires_before_appointment" ? "bg-red-500/10 text-red-700 dark:text-red-400" : "bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>{p.title}:</strong> {p.message}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">What to do next</p>
        {steps.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> You&apos;re well prepared. Keep practising your interview.</p>
        ) : (
          <ul className="space-y-1.5">
            {steps.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="group flex items-start gap-3 rounded-xl p-2 hover:bg-lp-sky">
                  {(() => {
                    const [, Icon, tone] = stepIcon(s.id)
                    return <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  })()}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{plainText(s.label)}</span>
                    <span className="block line-clamp-2 text-xs text-lp-muted">{plainText(s.detail)}</span>
                  </span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-lp-muted group-hover:text-lp-azure" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAppointment && !appointment && (
        <Link href="/dashboard/appointment" className="flex items-center gap-2 text-sm font-medium text-lp-azure underline">
          <CalendarClock className="h-4 w-4" /> Add your embassy appointment for reminders and a countdown
        </Link>
      )}
    </div>
  )
}
