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


export function QuickStats() {
  const { userData, interviewSessions, loading } = useDashboardData()
  const { readiness } = useReadiness()
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
    },
    {
        title: "AI review",
        value: metrics.reviewsCount > 0 ? `${metrics.reviewScore}%` : "--",
        label: metrics.reviewsCount > 0 ? `${metrics.reviewsCount} documents reviewed` : "Pending review",
        progress: metrics.reviewScore,
        link: "/dashboard/application",
        linkText: metrics.reviewsCount > 0 ? "View details" : "Start review",
        icon: Bot,
    },
    {
        title: "Interview readiness",
        value: `${readinessScore}%`,
        label: metrics.interviewsCount > 0 ? `${metrics.interviewsCount} sessions completed` : "Not started",
        progress: readinessScore,
        link: "/dashboard/ai-mock-interview",
        linkText: metrics.interviewsCount > 0 ? "Practise again" : "Begin practice",
        icon: Mic,
    },
  ]

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={cn("stat-card group flex flex-col p-5 transition-transform duration-300 motion-safe:hover:-translate-y-0.5", dashCard)}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-lp-muted">{stat.title}</h3>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lp-sky text-lp-azure">
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{stat.value}</div>
          <p className="mb-4 text-sm text-lp-muted">{stat.label}</p>
          <div className="mt-auto space-y-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-lp-sky" aria-hidden="true">
              <div className="h-full rounded-full bg-lp-azure transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, stat.progress)}%` }} />
            </div>
            <Link
              href={stat.link}
              className="group/link inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-lp-azure transition-colors hover:text-lp-azure-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
            >
              {stat.linkText}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
