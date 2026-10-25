"use client"

import { useEffect, useMemo, useRef } from "react"
import { FileText, Bot, Mic, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import gsap from "gsap"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { useDashboardData } from "@/context/DashboardDataContext"


export function QuickStats() {
  const { userData, reviews, interviewSessions, loading } = useDashboardData()
  const containerRef = useRef<HTMLDivElement>(null)

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

  const metrics = useMemo(() => {
    const uploadedDocs = userData?.documents ? Object.keys(userData.documents).length : 0

    const reviewsCount = reviews.length
    const reviewTotal = reviews.reduce((sum, r) => sum + (r.score || 0), 0)
    const reviewScore = reviewsCount > 0 ? Math.round(reviewTotal / reviewsCount) : 0

    const interviewsCount = interviewSessions.length
    const interviewTotal = interviewSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0)
    const interviewScore = interviewsCount > 0 ? Math.round(interviewTotal / interviewsCount) : 0

    return { uploadedDocs, reviewScore, reviewsCount, interviewScore, interviewsCount }
  }, [userData, reviews, interviewSessions])

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
  
  // Calculate overall readiness: 60% docs, 40% interview
  const readinessScore = Math.round(
    (metrics.reviewScore * 0.6) + (metrics.interviewScore * 0.4)
  )

  const stats = [
    {
        title: "Documents Status",
        value: `${metrics.uploadedDocs}/${totalRequiredDocs}`,
        label: "Documents uploaded",
        progress: docsProgress,
        icon: FileText,
        color: "blue",
    },
    {
        title: "AI Review Score",
        value: metrics.reviewsCount > 0 ? `${metrics.reviewScore}%` : '--',
        label: metrics.reviewsCount > 0 ? `${metrics.reviewsCount} documents reviewed` : 'Pending review',
        link: "/dashboard/application",
        linkText: metrics.reviewsCount > 0 ? 'View Details' : 'Start Review',
        icon: Bot,
        color: "purple",
    },
    {
        title: "Interview Readiness",
        value: metrics.interviewsCount > 0 ? `${readinessScore}%` : '0%',
        label: metrics.interviewsCount > 0 ? `${metrics.interviewsCount} sessions completed` : 'Not started',
        link: "/dashboard/ai-mock-interview",
        linkText: metrics.interviewsCount > 0 ? 'Practice Again' : 'Begin Practice',
        icon: Mic,
        color: "emerald",
    }
  ]

  return (
    <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, idx) => {
        // The last card is the dark accent block, echoing the home page's navy panels
        const dark = stat.color === 'emerald'
        return (
        <div 
          key={idx} 
          className={cn(
            "stat-card group relative overflow-hidden rounded-[1.5rem] border p-6 transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 lp-shadow",
            dark ? "border-transparent bg-lp-navy text-white sm:col-span-2 lg:col-span-1" : "border-lp-line bg-lp-card text-lp-fg"
          )}
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h3 className={cn("font-display text-[11px] font-medium uppercase tracking-[0.18em]", dark ? "text-white/60" : "text-lp-muted")}>{stat.title}</h3>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6", dark ? "bg-white/10 text-[#8FCDAF]" : "bg-lp-sky text-lp-azure")}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mb-1 font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
              {stat.value}
            </div>
            
            <p className={cn("mb-6 text-sm", dark ? "text-white/65" : "text-lp-muted")}>{stat.label}</p>
            
            <div className="mt-auto">
            {stat.progress !== undefined ? (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-lp-sky">
                <div 
                    className="h-full rounded-full bg-lp-azure transition-all duration-1000 ease-out" 
                    style={{ width: `${stat.progress}%` }} 
                />
              </div>
            ) : (
              <Link 
                href={stat.link!} 
                className={cn(
                  "group/link inline-flex items-center gap-2 rounded-sm font-display text-[11px] font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure",
                  dark ? "text-white/85 hover:text-white" : "text-lp-azure hover:text-lp-azure-2"
                )}
              >
                {stat.linkText}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden="true" />
              </Link>
            )}
            </div>
          </div>
        </div>
        )
      })}
    </div>
  )
}
