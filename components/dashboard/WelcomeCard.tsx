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
import { getRequiredDocuments } from "@/utils/documentConfig"
import {NumberTicker} from "@/components/ui/number-ticker";


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

  const totalRequiredDocs = getRequiredDocuments(userData?.onboarding?.visaType).length;

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
    <Card ref={cardRef} className="bg-gradient-to-br mb-10 from-indigo-600 via-blue-600 to-violet-700 text-white shadow-2xl border-none overflow-hidden relative p-6 md:p-8 group">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-colors duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 w-full">
          <div className="welcome-text">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Welcome back, {getFirstName()}!</h2>
            <p className="text-blue-50/80 max-w-lg mt-3 text-base md:text-lg font-medium">
              You're making great progress on your <span className="text-white font-bold underline decoration-blue-400 underline-offset-4">{userData?.onboarding?.destination || '...'} {userData?.onboarding?.visaType || '...'} Visa</span>.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-inner border border-white/10 flex-1">
              <div className="p-3 bg-white/20 rounded-xl shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-blue-200 font-bold">Next Step</div>
                <div className="font-bold text-lg">{currentStage.title}</div>
              </div>
            </div>

            <Link href={currentStage.link} className="shrink-0">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto h-16 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 bg-white text-blue-600 hover:bg-blue-50" aria-label={`Go to ${currentStage.title}`}>
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <div className="text-sm font-semibold text-blue-100">{reviewsCount} Reviews</div>
            </div>
            <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/5">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              <div className="text-sm font-semibold text-blue-100">{interviewsCount} Interviews</div>
            </div>
          </div>
        </div>

          <div className="stat-badge relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center flex-shrink-0 group/score">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl group-hover/score:bg-white/10 transition-colors"></div>
              <svg className="absolute inset-0 w-full h-full drop-shadow-2xl" viewBox="0 0 100 100">
                  <circle
                      className="text-white/10"
                      stroke="currentColor"
                      strokeWidth="6"
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                  />
                  <circle
                      ref={progressCircleRef}
                      className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      stroke="currentColor"
                      strokeWidth="7"
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
              <div className="text-center relative z-10 bg-white/5 backdrop-blur-sm w-40 h-40 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                  <div className="text-5xl md:text-7xl font-black drop-shadow-2xl flex items-baseline">
                    <NumberTicker className="text-white" value={readinessScore}/>
                    <span className="text-2xl md:text-3xl ml-1 opacity-80">%</span>
                  </div>
                  <div className="text-xs md:text-sm font-black text-blue-200 tracking-[0.2em] uppercase mt-1">Readiness</div>
              </div>
          </div>
      </div>
    </Card>
  )
}
