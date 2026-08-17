"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export interface ReviewDoc {
    id: string
    score?: number
    inconsistencies?: string[]
    risk_flags?: string[]
    missing_info?: string[]
    [key: string]: unknown
}

export interface InterviewSessionDoc {
    id: string
    feedback?: { overallScore?: number }
    [key: string]: unknown
}

interface DashboardData {
    userData: Record<string, any> | null
    reviews: ReviewDoc[]
    interviewSessions: InterviewSessionDoc[]
    loading: boolean
}

const DashboardDataContext = createContext<DashboardData>({
    userData: null,
    reviews: [],
    interviewSessions: [],
    loading: true,
})

// Single source of truth for the dashboard widgets. Several of them
// (WelcomeCard, QuickStats, NextActionCard, ProgressTracker, AlertsSection)
// used to each open their own onSnapshot listeners on the same users/{uid}
// doc plus the reviews/interview_sessions subcollections — 3-4x redundant
// Firestore connections and billed reads per dashboard load. This provider
// subscribes once and every widget reads from context instead.
export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<Record<string, any> | null>(null)
    const [reviews, setReviews] = useState<ReviewDoc[]>([])
    const [interviewSessions, setInterviewSessions] = useState<InterviewSessionDoc[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubUser: (() => void) | null = null
        let unsubReviews: (() => void) | null = null
        let unsubInterviews: (() => void) | null = null

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid)
                unsubUser = onSnapshot(userDocRef, (docSnap) => {
                    setUserData(docSnap.exists() ? docSnap.data() : null)
                    setLoading(false)
                })

                const reviewsRef = collection(db, "users", user.uid, "reviews")
                unsubReviews = onSnapshot(reviewsRef, (snapshot) => {
                    setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
                })

                const interviewsRef = collection(db, "users", user.uid, "interview_sessions")
                unsubInterviews = onSnapshot(interviewsRef, (snapshot) => {
                    setInterviewSessions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
                })
            } else {
                setUserData(null)
                setReviews([])
                setInterviewSessions([])
                setLoading(false)
            }
        })

        return () => {
            unsubscribeAuth()
            unsubUser?.()
            unsubReviews?.()
            unsubInterviews?.()
        }
    }, [])

    return (
        <DashboardDataContext.Provider value={{ userData, reviews, interviewSessions, loading }}>
            {children}
        </DashboardDataContext.Provider>
    )
}

export function useDashboardData() {
    return useContext(DashboardDataContext)
}
