"use client"

import { cn } from "@/lib/utils"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { Check as CheckIcon, Lock } from "lucide-react"
import { useDashboardData } from "@/context/DashboardDataContext"
import { useReadiness } from "@/hooks/useReadiness"
import { dashCard, dashCardSubtitle, dashCardTitle } from "./dashboardStyles"
import { MilestoneWatcher } from "./delight/MilestoneWatcher"
import { activeMemberOf } from "@/lib/family"


export function ProgressTracker() {
  const { userData, interviewSessions, loading } = useDashboardData()
  const { readiness } = useReadiness()
  const interviewsCount = interviewSessions.length

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

  if (loading) {
    return (
      <div className="h-[400px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>
    )
  }

  const completedOnboarding = userData?.completedOnboarding || false
  // Required documents only, so this agrees with the readiness panel and
  // the application page (lib/visaReadiness.ts).
  const uploadedDocsCount = readiness.uploadedRequired
  const docsProgress = Math.min(Math.round((uploadedDocsCount / totalRequiredDocs) * 100), 100)
  const docsCompleted = uploadedDocsCount >= totalRequiredDocs

  const reviewsCompleted = docsCompleted && readiness.reviewedRequired >= uploadedDocsCount

  const interviewsCompleted = interviewsCount > 0
  
  // Check if application is submitted (assuming a field exists or user can mark it)
  // For now, we just check if previous steps are done to unlock it.
  const applicationSubmitted = userData?.applicationSubmitted || false

  // Milestones done out of 5; shown as a count so it isn't confused with the readiness %.
  const milestonesDone = [completedOnboarding, docsCompleted, reviewsCompleted, interviewsCompleted, applicationSubmitted].filter(Boolean).length

  // Helper to render step status
  const renderStatus = (isCompleted: boolean, isInProgress: boolean, isLocked: boolean) => {
    const base = "w-fit rounded-full px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.16em]"
    if (isCompleted) {
      return <span className={cn(base, "bg-lp-sky text-lp-azure")}>Completed</span>
    }
    if (isInProgress) {
      return <span className={cn(base, "bg-lp-navy text-white")}>In Progress</span>
    }
    return <span className={cn(base, "inline-flex items-center gap-1 border border-lp-line text-lp-muted")}><Lock className="h-3 w-3" aria-hidden="true" />Locked</span>
  }

  const renderBar = (label: string, progress: number, done: boolean) => (
    <div className="mt-4">
      <div className="mb-2 flex justify-between font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">
        <span>{label}</span>
        <span className="text-lp-fg">{progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-lp-sky">
        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", done ? "bg-lp-azure" : "bg-lp-navy dark:bg-lp-azure")} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )

  const steps = [
    {
      title: "Visa Requirements",
      description: completedOnboarding ? `You've reviewed all requirements for your visa` : "Complete the onboarding process to unlock this step.",
      completed: completedOnboarding,
      inProgress: !completedOnboarding,
      locked: false,
    },
    {
      title: "Documents Preparation",
      description: "Upload your supporting documents",
      completed: docsCompleted,
      inProgress: !docsCompleted,
      locked: false,
      extra: renderBar(`${uploadedDocsCount} / ${totalRequiredDocs} uploaded`, docsProgress, docsCompleted),
    },
    {
      title: "AI Intelligence Check",
      description: "Automated error detection & scoring",
      completed: reviewsCompleted,
      inProgress: docsCompleted && !reviewsCompleted,
      locked: !docsCompleted,
      extra: docsCompleted ? renderBar(`${readiness.reviewedRequired} / ${totalRequiredDocs} reviewed`, Math.round((readiness.reviewedRequired / Math.max(1, totalRequiredDocs)) * 100), reviewsCompleted) : null,
    },
    {
      title: "Mock Interview",
      description: "Practice with AI-powered sessions",
      completed: interviewsCompleted,
      inProgress: reviewsCompleted && !interviewsCompleted,
      locked: !reviewsCompleted,
    },
    {
      title: "Visa Application",
      description: "Submit to the embassy",
      completed: applicationSubmitted,
      inProgress: interviewsCompleted && !applicationSubmitted,
      locked: !interviewsCompleted,
    },
  ]

  return (
    <div id="progress-tracker-card" className={cn("p-5 md:p-6", dashCard)}>
      <MilestoneWatcher count={milestonesDone} memberId={activeMemberOf(userData)} />
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className={dashCardTitle}>Your journey</h2>
          <p className={dashCardSubtitle}>Five milestones to your visa</p>
        </div>
        <span className="shrink-0 rounded-full bg-lp-sky px-3 py-1 text-sm font-semibold text-lp-azure">{milestonesDone} of 5 done</span>
      </div>

      {/* Desktop: a compact horizontal stepper, with the current step's detail below. */}
      <div className="hidden lg:block">
        <ol className="grid grid-cols-5">
          {steps.map((step, i) => {
            const current = !step.completed && step.inProgress
            return (
              <li key={step.title} className="relative flex flex-col items-center text-center">
                {i > 0 && (
                  <span
                    className={cn("absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2", steps[i - 1].completed ? "bg-lp-azure" : "bg-lp-line")}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors duration-500",
                    step.completed ? "bg-lp-azure text-white" : current ? "bg-lp-card text-lp-azure ring-2 ring-lp-azure" : "border border-lp-line bg-lp-card text-lp-muted"
                  )}
                >
                  {step.completed ? <CheckIcon className="h-5 w-5 stroke-[3]" /> : i + 1}
                </span>
                <span className={cn("mt-2 px-1 text-xs font-medium leading-tight", step.completed || current ? "text-lp-fg" : "text-lp-muted")}>{step.title}</span>
                <span className="sr-only">{step.completed ? "completed" : current ? "in progress" : "not started"}</span>
              </li>
            )
          })}
        </ol>
        {(() => {
          const current = steps.find((s) => !s.completed && s.inProgress) ?? steps.find((s) => !s.completed)
          return current ? (
            <div className="mt-5 rounded-2xl bg-lp-sky-2 p-4">
              <p className="text-sm font-semibold">Now: {current.title}</p>
              <p className="text-sm text-lp-muted">{current.description}</p>
              {current.extra}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-lp-sky-2 p-4 text-sm font-medium">Every milestone is done. Good luck with your visa!</p>
          )
        })()}
      </div>

      {/* Phones and tablets: the vertical list. */}
      <ol className="relative space-y-2 lg:hidden">
        <div className="absolute bottom-8 left-[35px] top-8 w-px bg-lp-line" aria-hidden="true"></div>

        {steps.map((step, i) => {
          const current = !step.completed && step.inProgress
          const dimmed = !step.completed && step.locked
          return (
            <li
              key={step.title}
              className={cn(
                "relative z-10 flex items-start rounded-2xl p-4 transition-colors duration-300",
                current ? "border border-lp-line bg-lp-sky-2" : "border border-transparent hover:bg-lp-card-2",
                dimmed && "opacity-50"
              )}
            >
              <div
                className={cn(
                  "relative mr-5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors duration-500",
                  step.completed
                    ? "bg-lp-azure text-white"
                    : current
                      ? "bg-lp-navy text-white ring-4 ring-lp-sky"
                      : "border border-lp-line bg-lp-card text-lp-muted"
                )}
              >
                {step.completed ? <CheckIcon className="h-5 w-5 stroke-[3]" /> : <span>{String(i + 1).padStart(2, "0")}</span>}
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <h3 className="font-display text-base font-semibold tracking-[-0.02em] md:text-lg">{step.title}</h3>
                  {renderStatus(step.completed, step.inProgress, step.locked)}
                </div>
                <p className="text-sm leading-relaxed text-lp-muted">{step.description}</p>
                {step.extra}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
