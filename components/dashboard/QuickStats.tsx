"use client"

import { useEffect, useMemo, useRef } from "react"
import { FileText, Bot, Mic, Loader2, TrendingUp, Award, Clock } from "lucide-react"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6 h-40 animate-pulse" />
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
        gradient: "from-blue-500/10 to-blue-600/5",
        iconColor: "text-blue-600",
        barColor: "bg-blue-600"
    },
    {
        title: "AI Review Score",
        value: metrics.reviewsCount > 0 ? `${metrics.reviewScore}%` : '--',
        label: metrics.reviewsCount > 0 ? `${metrics.reviewsCount} documents reviewed` : 'Pending review',
        link: "/dashboard/application",
        linkText: metrics.reviewsCount > 0 ? 'View Details →' : 'Start Review →',
        icon: Bot,
        color: "purple",
        gradient: "from-purple-500/10 to-purple-600/5",
        iconColor: "text-purple-600",
        barColor: "bg-purple-600"
    },
    {
        title: "Interview Readiness",
        value: metrics.interviewsCount > 0 ? `${readinessScore}%` : '0%',
        label: metrics.interviewsCount > 0 ? `${metrics.interviewsCount} sessions completed` : 'Not started',
        link: "/dashboard/ai-mock-interview",
        linkText: metrics.interviewsCount > 0 ? 'Practice Again →' : 'Begin Practice →',
        icon: Mic,
        color: "emerald",
        gradient: "from-emerald-500/10 to-emerald-600/5",
        iconColor: "text-emerald-600",
        barColor: "bg-emerald-600"
    }
  ]

  return (
    <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`stat-card group bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border p-4 md:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative ${stat.color === 'emerald' && 'sm:col-span-2 lg:col-span-1'}`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 dark:text-foreground">{stat.title}</h3>
              <div className={`p-2 rounded-xl bg-white dark:bg-secondary shadow-sm ${stat.iconColor}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>

            <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            
            <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4 font-medium">{stat.label}</p>
            
            {stat.progress !== undefined ? (
              <div className="w-full bg-gray-100 dark:bg-secondary rounded-full h-2.5 overflow-hidden">
                <div 
                    className={`${stat.barColor} h-full rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${stat.progress}%` }} 
                />
              </div>
            ) : (
              <Link 
                href={stat.link!} 
                className={`text-sm font-bold ${stat.iconColor} hover:underline inline-flex items-center gap-1`}
              >
                {stat.linkText}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
