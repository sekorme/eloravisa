"use client"

import { useEffect, useState } from "react"
import { Check as CheckIcon, Loader2, Bot, Mic, Send, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { format } from "date-fns"

const TOTAL_DOCUMENTS = 7; // Based on UploadDocumentsModal list

export function ProgressTracker() {
  const [userData, setUserData] = useState<any>(null)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [interviewsCount, setInterviewsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data())
          }
          setLoading(false)
        })

        const reviewsCollRef = collection(db, "users", user.uid, "reviews")
        const unsubscribeReviews = onSnapshot(reviewsCollRef, (snapshot) => {
            setReviewsCount(snapshot.size)
        })

        const interviewsCollRef = collection(db, "users", user.uid, "interview_sessions")
        const unsubscribeInterviews = onSnapshot(interviewsCollRef, (snapshot) => {
            setInterviewsCount(snapshot.size)
        })

        return () => {
            unsubscribeUser()
            unsubscribeReviews()
            unsubscribeInterviews()
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6 h-[400px] animate-pulse"></div>
    )
  }

  const completedOnboarding = userData?.completedOnboarding || false
  const uploadedDocsCount = userData?.documents ? Object.keys(userData.documents).length : 0
  const docsProgress = Math.min(Math.round((uploadedDocsCount / TOTAL_DOCUMENTS) * 100), 100)
  const docsCompleted = uploadedDocsCount >= TOTAL_DOCUMENTS

  const reviewsProgress = Math.min(Math.round((reviewsCount / TOTAL_DOCUMENTS) * 100), 100)
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
    <div id="progress-tracker-card" className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-foreground">Your Progress</h2>
        <span className="text-sm text-gray-500 dark:text-muted-foreground">5 Steps to Complete</span>
      </div>
      <div className="space-y-5">
        
        {/* Step 1: Onboarding */}
        <div className={cn("flex items-start cursor-pointer p-4 rounded-xl transition-all", completedOnboarding ? "hover:bg-gray-50 dark:hover:bg-accent/50" : "opacity-60")}>
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-full mr-4 flex-shrink-0", completedOnboarding ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-muted")}>
            {completedOnboarding ? <CheckIcon className="text-green-600 dark:text-green-400 text-xl w-6 h-6" /> : <Loader2 className="text-gray-400 dark:text-muted-foreground text-xl w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-foreground truncate">Visa Requirements Understood</h3>
              {renderStatus(completedOnboarding, !completedOnboarding, false)}
            </div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">{completedOnboarding ? `You've reviewed all requirements for ${userData?.onboarding?.destination || 'your'} ${userData?.onboarding?.visaType || ''} Visa` : "Complete the onboarding process to unlock this step."}</p>
            {completedOnboarding && userData?.createdAt && <div className="text-xs text-gray-500 dark:text-muted-foreground/70 mt-1">Started on {format(new Date(userData.createdAt), 'EEE, MMM d, yyyy')}</div>}
          </div>
        </div>

        {/* Step 2: Documents */}
        <div className={cn("flex items-start cursor-pointer p-4 rounded-xl transition-all border-2", docsCompleted ? "border-transparent hover:bg-gray-50 dark:hover:bg-accent/50" : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10")}>
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-full mr-4 flex-shrink-0 relative", docsCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-blue-100 dark:bg-blue-900/30")}>
            {docsCompleted ? <CheckIcon className="text-green-600 dark:text-green-400 text-xl w-6 h-6" /> : <><Loader2 className="text-blue-600 dark:text-blue-400 text-xl w-6 h-6 animate-spin" /><div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div></>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-foreground truncate">Documents Prepared</h3>
              {renderStatus(docsCompleted, !docsCompleted, false)}
            </div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">Upload all required documents for review</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-muted-foreground mb-1">
                <span>{uploadedDocsCount} of {TOTAL_DOCUMENTS} documents uploaded</span>
                <span className="font-semibold">{docsProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-secondary rounded-full h-2">
                <div className={cn("h-2 rounded-full transition-all duration-500", docsCompleted ? "bg-green-600 dark:bg-green-500" : "bg-blue-600 dark:bg-blue-500")} style={{ width: `${docsProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: AI Review */}
        <div className={cn("flex items-start cursor-pointer p-4 rounded-xl transition-all", !docsCompleted && "opacity-60")}>
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-full mr-4 flex-shrink-0", reviewsCompleted ? "bg-green-100 dark:bg-green-900/30" : docsCompleted ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-muted")}>
            {reviewsCompleted ? <CheckIcon className="text-green-600 dark:text-green-400 text-xl w-6 h-6" /> : docsCompleted ? <Bot className="text-blue-600 dark:text-blue-400 text-xl w-6 h-6" /> : <Lock className="text-gray-400 dark:text-muted-foreground text-xl w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-foreground truncate">Documents Reviewed (AI)</h3>
              {renderStatus(reviewsCompleted, docsCompleted && !reviewsCompleted, !docsCompleted)}
            </div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">AI will review your documents for errors and suggestions</p>
            {docsCompleted && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-muted-foreground mb-1">
                        <span>{reviewsCount} of {TOTAL_DOCUMENTS} documents reviewed</span>
                        <span className="font-semibold">{reviewsProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-secondary rounded-full h-2">
                        <div className={cn("h-2 rounded-full transition-all duration-500", reviewsCompleted ? "bg-green-600 dark:bg-green-500" : "bg-blue-600 dark:bg-blue-500")} style={{ width: `${reviewsProgress}%` }}></div>
                    </div>
                </div>
            )}
            {!docsCompleted && <div className="text-xs text-gray-500 dark:text-muted-foreground/70 mt-1">Complete previous step to unlock</div>}
          </div>
        </div>

        {/* Step 4: Mock Interview */}
        <div className={cn("flex items-start cursor-pointer p-4 rounded-xl transition-all", !reviewsCompleted && "opacity-60")}>
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-full mr-4 flex-shrink-0", interviewsCompleted ? "bg-green-100 dark:bg-green-900/30" : reviewsCompleted ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-muted")}>
            {interviewsCompleted ? <CheckIcon className="text-green-600 dark:text-green-400 text-xl w-6 h-6" /> : reviewsCompleted ? <Mic className="text-blue-600 dark:text-blue-400 text-xl w-6 h-6" /> : <Lock className="text-gray-400 dark:text-muted-foreground text-xl w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-foreground truncate">Mock Interview Completed</h3>
              {renderStatus(interviewsCompleted, reviewsCompleted && !interviewsCompleted, !reviewsCompleted)}
            </div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">Practice with AI-powered mock interview sessions</p>
            {!reviewsCompleted && <div className="text-xs text-gray-500 dark:text-muted-foreground/70 mt-1">Complete previous step to unlock</div>}
            {reviewsCompleted && interviewsCompleted && <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{interviewsCount} session(s) completed</div>}
          </div>
        </div>

        {/* Step 5: Apply */}
        <div className={cn("flex items-start cursor-pointer p-4 rounded-xl transition-all", !interviewsCompleted && "opacity-60")}>
          <div className={cn("flex items-center justify-center w-12 h-12 rounded-full mr-4 flex-shrink-0", applicationSubmitted ? "bg-green-100 dark:bg-green-900/30" : interviewsCompleted ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-muted")}>
            {applicationSubmitted ? <CheckIcon className="text-green-600 dark:text-green-400 text-xl w-6 h-6" /> : interviewsCompleted ? <Send className="text-blue-600 dark:text-blue-400 text-xl w-6 h-6" /> : <Lock className="text-gray-400 dark:text-muted-foreground text-xl w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
              <h3 className="font-semibold text-gray-800 dark:text-foreground truncate">Ready to Apply</h3>
              {renderStatus(applicationSubmitted, interviewsCompleted && !applicationSubmitted, !interviewsCompleted)}
            </div>
            <p className="text-sm text-gray-600 dark:text-muted-foreground">Submit your application to the embassy</p>
            {!interviewsCompleted && <div className="text-xs text-gray-500 dark:text-muted-foreground/70 mt-1">Complete all previous steps to unlock</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
