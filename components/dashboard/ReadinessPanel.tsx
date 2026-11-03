"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Gauge } from "lucide-react"
import { useReadiness } from "@/hooks/useReadiness"
import { plainText } from "@/lib/reviewIssues"
import { dashCard } from "@/components/dashboard/dashboardStyles"
import { Sparkline, useReadinessHistory } from "@/components/dashboard/delight/useReadinessHistory"

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
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-lp-muted">
            <Gauge className="h-4 w-4 text-lp-azure" /> Interview readiness
          </span>
          <div className="mt-1 flex items-end gap-3">
            <p className={`font-display text-4xl font-semibold tracking-[-0.04em] ${scoreTone(readiness.score)}`}>
              {readiness.score}
              <span className="text-base text-lp-muted">/100</span>
            </p>
            {/* Trend from daily snapshots; appears from the second day. */}
            {trend.hasTrend && (
              <div className="mb-1 flex items-center gap-2">
                <Sparkline points={trend.points} className="h-8 w-24 text-lp-azure" />
                {trend.change !== 0 && (
                  <span className={`text-xs font-semibold ${trend.change > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {trend.change > 0 ? "+" : ""}{trend.change} this week
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {showAppointment && appointment && days !== null && days >= 0 && (
          <Link href="/dashboard/appointment" className="rounded-2xl bg-lp-sky px-4 py-2 text-right">
            <span className="block font-display text-2xl font-semibold text-lp-azure">{days === 0 ? "Today" : days}</span>
            <span className="text-xs text-lp-muted">{days === 0 ? "embassy appointment" : `day${days === 1 ? "" : "s"} to your appointment`}</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {([
          ["Documents", readiness.parts.documents, `${readiness.uploadedRequired} uploaded`],
          ["AI review", readiness.parts.review, `${readiness.reviewedRequired} reviewed`],
          ["Interview", readiness.parts.interview, "last 3 sessions"],
        ] as const).map(([label, value, hint]) => (
          <div key={label} className="rounded-xl border border-lp-line p-2">
            <p className="font-display text-lg font-semibold">{value}</p>
            <p className="font-medium">{label}</p>
            <p className="text-lp-muted">{hint}</p>
          </div>
        ))}
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
                <Link href={s.href} className="group flex items-start justify-between gap-3 rounded-xl p-2 hover:bg-lp-sky">
                  <span>
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
