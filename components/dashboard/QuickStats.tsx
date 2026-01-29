"use client"

import { useEffect, useState } from "react"
import { FileText, Bot, Mic, Loader2 } from "lucide-react"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

const TOTAL_DOCUMENTS = 7; // Based on required list

export function QuickStats() {
  const [metrics, setMetrics] = useState({
    uploadedDocs: 0,
    reviewScore: 0,
    reviewsCount: 0,
    interviewScore: 0,
    interviewsCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. User Doc (Documents)
        const userDocRef = doc(db, "users", user.uid)
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            const docs = data.documents ? Object.keys(data.documents).length : 0
            setMetrics(prev => ({ ...prev, uploadedDocs: docs }))
          }
        })

        // 2. Reviews
        const reviewsRef = collection(db, "users", user.uid, "reviews")
        const unsubReviews = onSnapshot(reviewsRef, (snapshot) => {
          let totalScore = 0
          let count = 0
          snapshot.forEach(doc => {
            totalScore += doc.data().score || 0
            count++
          })
          setMetrics(prev => ({ 
            ...prev, 
            reviewsCount: count,
            reviewScore: count > 0 ? Math.round(totalScore / count) : 0 
          }))
        })

        // 3. Interviews
        const interviewsRef = collection(db, "users", user.uid, "interview_sessions")
        const unsubInterviews = onSnapshot(interviewsRef, (snapshot) => {
          let totalScore = 0
          let count = 0
          snapshot.forEach(doc => {
            totalScore += doc.data().feedback?.overallScore || 0
            count++
          })
          setMetrics(prev => ({ 
            ...prev, 
            interviewsCount: count,
            interviewScore: count > 0 ? Math.round(totalScore / count) : 0 
          }))
          setLoading(false)
        })

        return () => {
          unsubUser()
          unsubReviews()
          unsubInterviews()
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6 h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  const docsProgress = Math.min(Math.round((metrics.uploadedDocs / TOTAL_DOCUMENTS) * 100), 100)
  
  // Calculate overall readiness: 60% docs, 40% interview
  const readinessScore = Math.round(
    (metrics.reviewScore * 0.6) + (metrics.interviewScore * 0.4)
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Documents Status */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-foreground">Documents Status</h3>
          <FileText className="text-blue-600 dark:text-blue-400 text-xl w-6 h-6" />
        </div>
        <div className="text-4xl font-bold text-gray-800 dark:text-foreground mb-2">
            {metrics.uploadedDocs}/{TOTAL_DOCUMENTS}
        </div>
        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">Documents uploaded</p>
        <div className="w-full bg-gray-200 dark:bg-secondary rounded-full h-2">
          <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${docsProgress}%` }}></div>
        </div>
      </div>

      {/* AI Review Score */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-foreground">AI Review Score</h3>
          <Bot className="text-purple-600 dark:text-purple-400 text-xl w-6 h-6" />
        </div>
        <div className="text-4xl font-bold text-gray-800 dark:text-foreground mb-2">
            {metrics.reviewsCount > 0 ? `${metrics.reviewScore}%` : '--'}
        </div>
        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
            {metrics.reviewsCount > 0 ? `${metrics.reviewsCount} documents reviewed` : 'Pending review'}
        </p>
        <Link href="/dashboard/application" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 bg-transparent border-none cursor-pointer p-0">
            {metrics.reviewsCount > 0 ? 'View Details →' : 'Start Review →'}
        </Link>
      </div>

      {/* Interview Readiness */}
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-foreground">Interview Readiness</h3>
          <Mic className="text-green-600 dark:text-green-400 text-xl w-6 h-6" />
        </div>
        <div className="text-4xl font-bold text-gray-800 dark:text-foreground mb-2">
            {metrics.interviewsCount > 0 ? `${readinessScore}%` : '0%'}
        </div>
        <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4">
            {metrics.interviewsCount > 0 ? `${metrics.interviewsCount} sessions completed` : 'Not started'}
        </p>
        <Link href="/dashboard/ai-mock-interview" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 bg-transparent border-none cursor-pointer p-0">
            {metrics.interviewsCount > 0 ? 'Practice Again →' : 'Begin Practice →'}
        </Link>
      </div>
    </div>
  )
}
