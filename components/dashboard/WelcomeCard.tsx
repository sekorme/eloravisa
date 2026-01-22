"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"
import { gsap } from "gsap"
import {NumberTicker} from "@/components/ui/number-ticker";

const TOTAL_DOCUMENTS = 7; // Based on required list

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
  const [userData, setUserData] = useState<UserData | null>(null)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [interviewsCount, setInterviewsCount] = useState(0)
  const [readinessScore, setReadinessScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState({ docAvg: 0, interviewMax: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null
    let unsubscribeReviews: (() => void) | null = null
    let unsubscribeInterviews: (() => void) | null = null

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            // defer to avoid sync setState in effect
            void Promise.resolve().then(() => setUserData(docSnap.data() as UserData))
          }
        })

        const reviewsCollRef = collection(db, "users", user.uid, "reviews")
        unsubscribeReviews = onSnapshot(reviewsCollRef, (snapshot) => {
            // defer updates to avoid synchronous setState-in-effect
            void Promise.resolve().then(() => setReviewsCount(snapshot.size))
            let totalScore = 0;
            snapshot.forEach(doc => { totalScore += doc.data().score || 0; });
            const avgDocScore = snapshot.size > 0 ? totalScore / snapshot.size : 0;
            // avoid synchronous setState-in-effect by deferring
            void Promise.resolve().then(() => setScores(prev => ({ ...prev, docAvg: avgDocScore })));
        })

        const interviewsCollRef = collection(db, "users", user.uid, "interview_sessions")
        unsubscribeInterviews = onSnapshot(interviewsCollRef, (snapshot) => {
            // defer updates to avoid synchronous setState-in-effect
            void Promise.resolve().then(() => setInterviewsCount(snapshot.size))
            let maxScore = 0;
            snapshot.forEach(doc => {
                const score = doc.data().feedback?.overallScore || 0;
                if (score > maxScore) maxScore = score;
            });
            // avoid synchronous setState-in-effect by deferring
            void Promise.resolve().then(() => setScores(prev => ({ ...prev, interviewMax: maxScore })));
        })

        // listeners attached - mark loading false once
        void Promise.resolve().then(() => setLoading(false))

      } else {
        // defer to avoid sync setState in effect
        void Promise.resolve().then(() => setLoading(false))
      }
    })

    return () => {
      // cleanup all listeners
      try { unsubscribeAuth(); } catch {}
      if (unsubscribeUser) {
        try { unsubscribeUser(); } catch {}
      }
      if (unsubscribeReviews) {
        try { unsubscribeReviews(); } catch {}
      }
      if (unsubscribeInterviews) {
        try { unsubscribeInterviews(); } catch {}
      }
    }
  }, [])

  useEffect(() => {
    const weightedScore = Math.round((scores.docAvg * 0.6) + (scores.interviewMax * 0.4));
    // defer to avoid set-state-in-effect lint rule
    void Promise.resolve().then(() => setReadinessScore(weightedScore));
  }, [scores]);

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
    const docsCompleted = uploadedDocsCount >= TOTAL_DOCUMENTS;
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
    <Card ref={cardRef} className="bg-gradient-to-br  mb-10 from-blue-600 to-indigo-700 text-white shadow-2xl border-none overflow-hidden relative p-6 md:p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-12 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 w-full">
          <div className="welcome-text">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Welcome back, {getFirstName()}!</h2>
            <p className="text-blue-100 max-w-lg mt-2 text-sm md:text-base">
              You are on track for your <strong className="font-semibold">{userData?.onboarding?.destination || '...'} {userData?.onboarding?.visaType || '...'} Visa</strong>. Continue to the next step below to make progress.
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 bg-white/8 rounded-lg p-3 shadow-sm">
              <div className="p-2 bg-white/20 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-blue-100">Next Step</div>
                <div className="font-semibold">{currentStage.title}</div>
              </div>
            </div>

            <Link href={currentStage.link} className="ml-0 sm:ml-4 mt-2 sm:mt-0">
              <Button variant="secondary" className="inline-flex items-center gap-2" aria-label={`Go to ${currentStage.title}`}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="ml-auto flex items-center gap-3 mt-2 sm:mt-0">
              <div className="flex items-center gap-2 bg-white/6 px-3 py-2 rounded-xl">
                <div className="text-xs text-blue-100">Document Reviews</div>
                <div className="font-semibold">{reviewsCount}</div>
              </div>
              <div className="flex items-center gap-2 bg-white/6 px-3 py-2 rounded-xl">
                <div className="text-xs text-blue-100">Mock Interviews</div>
                <div className="font-semibold">{interviewsCount}</div>
              </div>
            </div>
          </div>
        </div>

          <div className="stat-badge relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center flex-shrink-0">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle
                      className="text-white/10"
                      stroke="currentColor"
                      strokeWidth="6"
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                  />
                  <circle
                      ref={progressCircleRef}
                      className="text-white drop-shadow-lg"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45}
                      transform="rotate(-90 50 50)"
                  />
              </svg>
              <div className="text-center">
                  <div className="text-4xl md:text-6xl  font-bold drop-shadow-md">{<NumberTicker className={"text-green-500"} value={readinessScore}/>}%</div>
                  <div className="text-sm font-medium text-blue-100 dark:text-blue-200 tracking-wider uppercase">Readiness</div>
              </div>
          </div>
      </div>
    </Card>
  )
}
