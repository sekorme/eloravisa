"use client"

import { useEffect, useMemo, useRef } from "react"
import { FileText, Bot, Mic, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import gsap from "gsap"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { useDashboardData } from "@/context/DashboardDataContext"
import { dashCard } from "./dashboardStyles"
import { useReadiness } from "@/hooks/useReadiness"
import { Sparkline, useReadinessHistory } from "./delight/useReadinessHistory"


const TONES = {
  green: { bar: "bg-emerald-500", ring: "text-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  sky: { bar: "bg-sky-500", ring: "text-sky-500", text: "text-sky-700 dark:text-sky-300" },
  violet: { bar: "bg-violet-500", ring: "text-violet-500", text: "text-violet-700 dark:text-violet-300" },
} as const

/** Icon inside a small ring that fills with the metric's progress. */
function ProgressRing({ value, className, children }: { value: number; className: string; children: React.ReactNode }) {
  const r = 18
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, value))
  return (
    <span className={cn("relative flex h-11 w-11 shrink-0 items-center justify-center", className)}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} className="transition-[stroke-dashoffset] duration-1000" />
      </svg>
      {children}
    </span>
  )
}

export function QuickStats() {
  const { userData, interviewSessions, loading } = useDashboardData()
  const { readiness } = useReadiness()
  const trend = useReadinessHistory()
  const containerRef = useRef<HTMLDivElement>(null)

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

  // Required documents only, from the shared readiness numbers, so this row
  // agrees with the readiness panel, journey and application page.
  const metrics = useMemo(() => {
    const uploadedDocs = readiness.uploadedRequired
    const reviewsCount = readiness.reviewedRequired
    const reviewScore = readiness.parts.review

    const interviewsCount = interviewSessions.length
    const interviewTotal = interviewSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0)
    const interviewScore = interviewsCount > 0 ? Math.round(interviewTotal / interviewsCount) : 0

    return { uploadedDocs, reviewScore, reviewsCount, interviewScore, interviewsCount }
  }, [readiness, interviewSessions])

  useEffect(() => {
    if (!loading && containerRef.current) {
        gsap.from(".stat-card", {
            scale: 0.9,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        })
    }
  }, [loading])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2" />
        ))}
      </div>
    )
  }

  const docsProgress = Math.min(Math.round((metrics.uploadedDocs / totalRequiredDocs) * 100), 100)
  
  // Same score as the readiness panel and eloraadmin (lib/visaReadiness.ts).
  const readinessScore = readiness.score

  const stats = [
    {
        title: "Documents",
        value: `${metrics.uploadedDocs}/${totalRequiredDocs}`,
        label: "Required documents uploaded",
        progress: docsProgress,
        link: "/dashboard/application",
        linkText: metrics.uploadedDocs < totalRequiredDocs ? "Upload next" : "View documents",
        icon: FileText,
        tone: "green" as const,
    },
    {
        title: "AI review",
        value: metrics.reviewsCount > 0 ? `${metrics.reviewScore}%` : "--",
        label: metrics.reviewsCount > 0 ? `${metrics.reviewsCount} documents reviewed` : "Pending review",
        progress: metrics.reviewScore,
        link: "/dashboard/application",
        linkText: metrics.reviewsCount > 0 ? "View details" : "Start review",
        icon: Bot,
        tone: "sky" as const,
    },
    {
        title: "Interview readiness",
        value: `${readinessScore}%`,
        label: metrics.interviewsCount > 0 ? `${metrics.interviewsCount} sessions completed` : "Not started",
        progress: readinessScore,
        link: "/dashboard/ai-mock-interview",
        linkText: metrics.interviewsCount > 0 ? "Practise again" : "Begin practice",
        icon: Mic,
        tone: "violet" as const,
        trend: true,
    },
  ]

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const tone = TONES[stat.tone]
        return (
        <div
          key={stat.title}
          className={cn("stat-card group relative flex flex-col overflow-hidden p-5 transition-transform duration-300 motion-safe:hover:-translate-y-0.5", dashCard)}
        >
          {/* Coloured accent bar: one colour per metric. */}
          <span className={cn("absolute inset-x-0 top-0 h-1", tone.bar)} aria-hidden="true" />
          <div className="mb-3 flex items-start justify-between">
            <h3 className="pt-1 text-sm font-medium text-lp-muted">{stat.title}</h3>
            <ProgressRing value={stat.progress} className={tone.ring}>
              <stat.icon className="h-4 w-4" />
            </ProgressRing>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="font-display text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{stat.value}</div>
            {stat.trend && trend.hasTrend && <Sparkline points={trend.points} className={cn("mb-1 h-8 w-20", tone.text)} />}
          </div>
          <p className="mb-4 text-sm text-lp-muted">{stat.label}</p>
          <Link
            href={stat.link}
            className={cn("group/link mt-auto inline-flex items-center gap-1.5 rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure", tone.text)}
          >
            {stat.linkText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        )
      })}
    </div>
  )
}
