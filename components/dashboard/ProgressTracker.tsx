"use client"

import { cn } from "@/lib/utils"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { format } from "date-fns"
import { Check as CheckIcon, Loader2, Bot, Mic, Send, Lock } from "lucide-react"
import { useDashboardData } from "@/context/DashboardDataContext"


export function ProgressTracker() {
  const { userData, reviews, interviewSessions, loading } = useDashboardData()
  const reviewsCount = reviews.length
  const interviewsCount = interviewSessions.length

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6 h-[400px] animate-pulse"></div>
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

  // Helper to render step status
  const renderStatus = (isCompleted: boolean, isInProgress: boolean, isLocked: boolean) => {
    if (isCompleted) {
      return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-3 py-1 rounded-full w-fit">Completed</span>
    }
    if (isInProgress) {
      return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full w-fit">In Progress</span>
    }
    return <span className="bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground text-xs font-semibold px-3 py-1 rounded-full w-fit">Locked</span>
  }

  return (
    <div id="progress-tracker-card" className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-6 md:p-8 transition-all duration-300 hover:shadow-2xl group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">Your Journey</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">5 milestones to reach your goal</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-800/50">
           <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">Overall Progress: {Math.round(( (completedOnboarding ? 20 : 0) + (docsCompleted ? 20 : 0) + (reviewsCompleted ? 20 : 0) + (interviewsCompleted ? 20 : 0) + (applicationSubmitted ? 20 : 0) ))} %</span>
        </div>
      </div>
      <div className="space-y-6 relative">
        <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-neutral-100 dark:bg-neutral-800 -z-0"></div>
        
        {/* Step 1: Onboarding */}
        <div className={cn("flex items-start relative z-10 p-4 rounded-2xl transition-all duration-300 group/step", completedOnboarding ? "bg-white dark:bg-neutral-800/50 hover:shadow-lg" : "opacity-60")}>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full mr-6 flex-shrink-0 transition-all duration-500", completedOnboarding ? "bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
            {completedOnboarding ? <CheckIcon className="w-6 h-6 stroke-[3]" /> : <span className="font-bold">1</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className={cn("font-bold text-lg tracking-tight", completedOnboarding ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-500")}>Visa Requirements</h3>
              {renderStatus(completedOnboarding, !completedOnboarding, false)}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">{completedOnboarding ? `You've reviewed all requirements for your visa` : "Complete the onboarding process to unlock this step."}</p>
          </div>
        </div>

        {/* Step 2: Documents */}
        <div className={cn("flex items-start relative z-10 p-4 rounded-2xl transition-all duration-300 group/step", docsCompleted ? "bg-white dark:bg-neutral-800/50 hover:shadow-lg" : "bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 shadow-sm")}>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full mr-6 flex-shrink-0 transition-all duration-500 relative", docsCompleted ? "bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none" : "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none")}>
            {docsCompleted ? <CheckIcon className="w-6 h-6 stroke-[3]" /> : <span className="font-bold">2</span>}
            {!docsCompleted && <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className={cn("font-bold text-lg tracking-tight", docsCompleted ? "text-neutral-800 dark:text-neutral-100" : "text-blue-600 dark:text-blue-400")}>Documents Preparation</h3>
              {renderStatus(docsCompleted, !docsCompleted, false)}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">Upload your supporting documents</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-neutral-500 mb-2">
                <span>{uploadedDocsCount} / {totalRequiredDocs} UPLOADED</span>
                <span>{docsProgress}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden p-0.5">
                <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", docsCompleted ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-indigo-600")} style={{ width: `${docsProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: AI Review */}
        <div className={cn("flex items-start relative z-10 p-4 rounded-2xl transition-all duration-300 group/step", !docsCompleted ? "opacity-40" : "bg-white dark:bg-neutral-800/50 hover:shadow-lg")}>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full mr-6 flex-shrink-0 transition-all duration-500", reviewsCompleted ? "bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none" : docsCompleted ? "bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
            {reviewsCompleted ? <CheckIcon className="w-6 h-6 stroke-[3]" /> : <span className="font-bold">3</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className={cn("font-bold text-lg tracking-tight", reviewsCompleted ? "text-neutral-800 dark:text-neutral-100" : docsCompleted ? "text-purple-600 dark:text-purple-400" : "text-neutral-500")}>AI Intelligence Check</h3>
              {renderStatus(reviewsCompleted, docsCompleted && !reviewsCompleted, !docsCompleted)}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">Automated error detection & scoring</p>
            {docsCompleted && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-neutral-500 mb-2">
                        <span>{reviewsCount} / {totalRequiredDocs} REVIEWED</span>
                        <span>{reviewsProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden p-0.5">
                        <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", reviewsCompleted ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-pink-600")} style={{ width: `${reviewsProgress}%` }}></div>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Step 4: Mock Interview */}
        <div className={cn("flex items-start relative z-10 p-4 rounded-2xl transition-all duration-300 group/step", !reviewsCompleted ? "opacity-40" : "bg-white dark:bg-neutral-800/50 hover:shadow-lg")}>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full mr-6 flex-shrink-0 transition-all duration-500", interviewsCompleted ? "bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none" : reviewsCompleted ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
            {interviewsCompleted ? <CheckIcon className="w-6 h-6 stroke-[3]" /> : <span className="font-bold">4</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className={cn("font-bold text-lg tracking-tight", interviewsCompleted ? "text-neutral-800 dark:text-neutral-100" : reviewsCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-500")}>Mock Interview</h3>
              {renderStatus(interviewsCompleted, reviewsCompleted && !interviewsCompleted, !reviewsCompleted)}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">Practice with AI-powered sessions</p>
          </div>
        </div>

        {/* Step 5: Apply */}
        <div className={cn("flex items-start relative z-10 p-4 rounded-2xl transition-all duration-300 group/step", !interviewsCompleted ? "opacity-40" : "bg-white dark:bg-neutral-800/50 hover:shadow-lg")}>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-full mr-6 flex-shrink-0 transition-all duration-500", applicationSubmitted ? "bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none" : interviewsCompleted ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}>
            {applicationSubmitted ? <CheckIcon className="w-6 h-6 stroke-[3]" /> : <span className="font-bold">5</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className={cn("font-bold text-lg tracking-tight", applicationSubmitted ? "text-neutral-800 dark:text-neutral-100" : interviewsCompleted ? "text-indigo-600 dark:text-indigo-400" : "text-neutral-500")}>Visa Application</h3>
              {renderStatus(applicationSubmitted, interviewsCompleted && !applicationSubmitted, !interviewsCompleted)}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">Submit to the embassy</p>
          </div>
        </div>
      </div>
    </div>
  )
}
