"use client"

import { useEffect, useMemo, useRef } from "react"
import { Card } from "@/components/ui/card"
import { pillClass } from "@/components/landing/ui"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { gsap } from "gsap"
import { getRequiredDocuments } from "@/utils/documentConfig"
import {NumberTicker} from "@/components/ui/number-ticker";
import { useDashboardData } from "@/context/DashboardDataContext"


// Local types to avoid `any` and improve clarity
interface OnboardingChecks {
  visaRequirementsUnderstood?: boolean
  documentsPrepared?: boolean
  documentsReviewedAI?: boolean
  mockInterviewCompleted?: boolean
}

interface UserOnboarding {
  destination?: string
  visaType?: string
  checks?: OnboardingChecks
}

interface UserData {
  fullName?: string
  onboarding?: UserOnboarding
  completedOnboarding?: boolean
  documents?: Record<string, unknown>
}

export function WelcomeCard() {
  const { userData: rawUserData, reviews, interviewSessions, loading } = useDashboardData()
  const userData = rawUserData as UserData | null

  const cardRef = useRef<HTMLDivElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

  const reviewsCount = reviews.length
  const interviewsCount = interviewSessions.length

  const readinessScore = useMemo(() => {
    const totalScore = reviews.reduce((sum, r) => sum + (r.score || 0), 0)
    const docAvg = reviews.length > 0 ? totalScore / reviews.length : 0
    const interviewMax = interviewSessions.reduce((max, s) => Math.max(max, s.feedback?.overallScore || 0), 0)
    return Math.round((docAvg * 0.6) + (interviewMax * 0.4))
  }, [reviews, interviewSessions])

  useEffect(() => {
    // Do not start animations while loading
    if (loading || !cardRef.current) return

    // Scope animations to this component using gsap.context and clean up on unmount
    const root = cardRef.current
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      // animate the card container
      tl.from(root, { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" })
        // scope selectors to the card root to avoid global selector collisions
        .from(root.querySelectorAll(".welcome-text"), { opacity: 0, y: 20, duration: 0.45, stagger: 0.08 }, "-=0.35")
        .from(root.querySelectorAll(".stat-badge"), { opacity: 0, scale: 0.85, duration: 0.55, ease: "back.out(1.6)" }, "-=0.4")

      // animate the SVG progress ring (ensure stroke values are set before animating)
      if (progressCircleRef.current) {
        const r = progressCircleRef.current.r.baseVal.value
        const circumference = 2 * Math.PI * r
        const offset = circumference - (readinessScore / 100) * circumference

        // make sure the stroke dash values are explicitly set on the element
        gsap.set(progressCircleRef.current, { strokeDasharray: circumference, strokeDashoffset: circumference })

        gsap.to(progressCircleRef.current, {
          strokeDashoffset: offset,
          duration: 1.4,
          ease: "power2.inOut",
          delay: 0.45,
          overwrite: true,
        })
      }
    }, cardRef)

    return () => ctx.revert()
  }, [loading, readinessScore]);

  const getFirstName = () => {
    if (!userData?.fullName) return "User"
    return userData.fullName.split(" ")[0]
  }

  const getCurrentStage = () => {
    if (!userData) return { title: "Getting Started", link: "/onboarding" };

    const completedOnboarding = userData.completedOnboarding || false;
    const uploadedDocsCount = userData.documents ? Object.keys(userData.documents).length : 0;
    const docsCompleted = uploadedDocsCount >= totalRequiredDocs;
    const reviewsCompleted = docsCompleted && reviewsCount >= uploadedDocsCount;
    const interviewsCompleted = interviewsCount > 0;

    if (!completedOnboarding) return { title: "Complete Onboarding", link: "/onboarding" };
    if (!docsCompleted) return { title: "Upload Documents", link: "/dashboard/application" };
    if (!reviewsCompleted) return { title: "Review Documents (AI)", link: "/dashboard/application" };
    if (!interviewsCompleted) return { title: "Practice Mock Interview", link: "/dashboard/ai-mock-interview" };
    return { title: "Ready to Apply", link: "/dashboard/application" };
  }

  const currentStage = getCurrentStage();

  return (
    <Card ref={cardRef} className="relative overflow-hidden rounded-[2rem] border-none bg-lp-navy p-6 text-white md:p-10 lp-shadow">
      <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden="true"></div>
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#5DBF95]/20 blur-3xl" aria-hidden="true"></div>
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-lp-navy-2 blur-3xl" aria-hidden="true"></div>

      <div className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row">
        <div className="w-full flex-1">
          <div className="welcome-text">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/85 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8FCDAF]"></span>
              Your visa journey
            </span>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-balance md:text-5xl lg:text-6xl">
              Welcome back, <span className="text-[#8FCDAF]">{getFirstName()}</span>
            </h2>
            <p className="mt-4 max-w-lg text-base text-white/70 md:text-lg">
              You're making great progress on your <span className="font-semibold text-white">{userData?.onboarding?.destination || '...'} {userData?.onboarding?.visaType || '...'} Visa</span>.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8FCDAF]/15">
                <CheckCircle2 className="h-5 w-5 text-[#8FCDAF]" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">Next Step</div>
                <div className="truncate font-display text-lg font-semibold tracking-tight">{currentStage.title}</div>
              </div>
            </div>

            <Link href={currentStage.link} className={pillClass("white", "lg", "w-full sm:w-auto h-auto min-h-14")} aria-label={`Go to ${currentStage.title}`}>
              Continue
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#8FCDAF]"></div>
              <div className="text-sm font-medium text-white/80"><span className="font-semibold text-white">{reviewsCount}</span> Reviews</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-white/60"></div>
              <div className="text-sm font-medium text-white/80"><span className="font-semibold text-white">{interviewsCount}</span> Interviews</div>
            </div>
          </div>
        </div>

          <div className="stat-badge relative flex h-56 w-56 flex-shrink-0 items-center justify-center md:h-64 md:w-64">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                      className="text-white/10"
                      stroke="currentColor"
                      strokeWidth="5"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                  />
                  <circle
                      ref={progressCircleRef}
                      className="text-[#8FCDAF]"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42}
                      transform="rotate(-90 50 50)"
                  />
              </svg>
              <div className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-center md:h-48 md:w-48">
                  <div className="flex items-baseline font-display text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
                    <NumberTicker className="text-white" value={readinessScore}/>
                    <span className="ml-0.5 text-xl text-white/60 md:text-2xl">%</span>
                  </div>
                  <div className="mt-1.5 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">Readiness</div>
              </div>
          </div>
      </div>
    </Card>
  )
}
