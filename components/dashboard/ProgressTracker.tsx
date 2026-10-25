"use client"

import { cn } from "@/lib/utils"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { Check as CheckIcon, Lock } from "lucide-react"
import { useDashboardData } from "@/context/DashboardDataContext"


export function ProgressTracker() {
  const { userData, reviews, interviewSessions, loading } = useDashboardData()
  const reviewsCount = reviews.length
  const interviewsCount = interviewSessions.length

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

  if (loading) {
    return (
      <div className="h-[400px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>
    )
  }

  const completedOnboarding = userData?.completedOnboarding || false
  const uploadedDocsCount = userData?.documents ? Object.keys(userData.documents).length : 0
  const docsProgress = Math.min(Math.round((uploadedDocsCount / totalRequiredDocs) * 100), 100)
  const docsCompleted = uploadedDocsCount >= totalRequiredDocs

  const reviewsProgress = Math.min(Math.round((reviewsCount / totalRequiredDocs) * 100), 100)
  const reviewsCompleted = docsCompleted && reviewsCount >= uploadedDocsCount

  const interviewsCompleted = interviewsCount > 0
  
  // Check if application is submitted (assuming a field exists or user can mark it)
  // For now, we just check if previous steps are done to unlock it.
  const applicationSubmitted = userData?.applicationSubmitted || false

  const overallProgress = (completedOnboarding ? 20 : 0) + (docsCompleted ? 20 : 0) + (reviewsCompleted ? 20 : 0) + (interviewsCompleted ? 20 : 0) + (applicationSubmitted ? 20 : 0)

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
      extra: docsCompleted ? renderBar(`${reviewsCount} / ${totalRequiredDocs} reviewed`, reviewsProgress, reviewsCompleted) : null,
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
    <div id="progress-tracker-card" className="h-full rounded-[1.5rem] border border-lp-line bg-lp-card p-6 text-lp-fg md:p-8 lp-shadow">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">5 milestones to reach your goal</span>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] md:text-3xl">Your Journey</h2>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-lp-line bg-lp-sky-2 py-1.5 pl-4 pr-1.5">
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">Overall Progress</span>
          <span className="rounded-full bg-lp-navy px-3 py-1 font-display text-sm font-semibold text-white">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      <ol className="relative space-y-2">
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
