"use client"

import { useState, useEffect, useRef } from "react"
import { InterviewSetup } from "@/components/interview/InterviewSetup"
import { InterviewSession, QAResult } from "@/components/interview/InterviewSession"
import { InterviewFeedback, Feedback } from "@/components/interview/InterviewFeedback"
import { InterviewHistory } from "@/components/interview/InterviewHistory"
import { generateInterviewFeedback } from "@/action/interview"
import { gsap } from "gsap"
import { Mic } from "lucide-react"
import { auth, db } from "@/firebase/client"
import { collection, addDoc } from "firebase/firestore"
import { toast } from "sonner"

export default function MockVisaInterviewPage() {
    const [step, setStep] = useState<"setup" | "interview" | "complete" | "feedback">("setup")
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
    const [interviewContext, setInterviewContext] = useState<any>(null)
    const [sessionFeedback, setSessionFeedback] = useState<Feedback | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Main container entrance
            gsap.from(".main-content", {
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: "power3.out"
            })

            // Staggered entrance for setup grid items
            if (step === "setup") {
                gsap.from(".setup-item", {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: "power3.out",
                    delay: 0.2
                })

                gsap.from(".history-section", {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    delay: 0.6,
                    ease: "power3.out"
                })
            }
        }, containerRef)

        return () => ctx.revert()
    }, [step])

    // The interview is already paid for by the time this runs — the charge
    // happens server-side in generateInterviewQuestions (action/interview.ts),
    // which InterviewSetup calls before onStart.
    const startInterview = async (questions: string[], contextData: any) => {
        const user = auth.currentUser;
        if (!user) {
            toast.error("Please sign in first");
            return;
        }

        setSelectedQuestions(questions)
        setInterviewContext(contextData)
        setSessionFeedback(null)
        setStep("interview")
    }

    const handleComplete = async (results: QAResult[]) => {
        setStep("complete")

        // The transcript for feedback generation, in the same shape the live
        // voice flow saves: the officer's questions as "model", answers as "user".
        const transcript = results.flatMap((r, i) => [
            { id: `q-${i}`, role: "model", text: r.question, timestamp: Date.now() },
            { id: `a-${i}`, role: "user", text: r.answer, timestamp: Date.now() },
        ])

        let feedback: any = null
        try {
            const idToken = await auth.currentUser?.getIdToken()
            if (idToken) {
                const response = await generateInterviewFeedback(idToken, transcript)
                if (response.success) feedback = response.data
            }
        } catch (err) {
            console.warn("Feedback generation failed:", err)
        }

        if (!feedback) {
            // Fall back to the per-answer scores so the session still ends
            // with something useful instead of an error screen.
            const scores = results
                .map(r => r.analysis?.score)
                .filter((s): s is number => typeof s === "number")
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
            feedback = {
                clarityScore: avg,
                consistencyScore: avg,
                confidenceScore: avg,
                overallScore: avg,
                summary: "Session scored from your per-answer results. Detailed analysis was unavailable this time.",
                strengths: [],
                weaknesses: [],
                recommendations: results
                    .filter(r => r.analysis?.better_answer)
                    .slice(0, 5)
                    .map(r => `For "${r.question}" — try: ${r.analysis!.better_answer}`),
            }
        }

        // Save to history (same collection/shape the voice flows use, so it
        // shows up in InterviewHistory). A failed save shouldn't block feedback.
        try {
            if (auth.currentUser) {
                await addDoc(collection(db, "users", auth.currentUser.uid, "interview_sessions"), {
                    date: new Date().toISOString(),
                    transcript,
                    destination: interviewContext?.destination || "",
                    visaType: interviewContext?.visaType || "",
                    feedback,
                    status: "completed",
                    mode: "text",
                })
            }
        } catch (err) {
            console.warn("Failed to save interview session:", err)
            toast.error("Couldn't save this session to your history.")
        }

        setSessionFeedback({
            scores: {
                clarity: feedback.clarityScore ?? feedback.overallScore ?? 0,
                consistency: feedback.consistencyScore ?? feedback.overallScore ?? 0,
                confidence: feedback.confidenceScore ?? feedback.overallScore ?? 0,
                overall: feedback.overallScore ?? 0,
            },
            summary: feedback.summary,
            strengths: feedback.strengths || [],
            weaknesses: feedback.weaknesses || [],
            recommendations: feedback.recommendations || [],
        })
        setStep("feedback")
    }

    return (
        <main className="min-h-screen p-2 md:p-6 w-full">
            <div ref={containerRef} className="w-full space-y-8 main-content">

                {step === "setup" && (
                    <div className="space-y-8">
                        <div className="flex flex-col gap-1 px-1 setup-item">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Mock Interview</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Practice your interview skills with our intelligent AI mentor.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 setup-item">
                                <InterviewSetup onStart={startInterview} />
                            </div>
                            <div className="space-y-6 setup-item">
                                <div className="p-6 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold mb-2">Ready to Shine?</h3>
                                    <p className="text-primary-foreground/90 text-sm mb-4 leading-relaxed">
                                        Embassy interviews are about confidence and consistency. Our AI helps you master both.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
                                        <Mic size={14} />
                                        <span>Real-time analysis</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border shadow-sm">
                                    <h4 className="font-bold mb-3 text-slate-900 dark:text-white uppercase text-xs tracking-widest">Interview Tips</h4>
                                    <ul className="space-y-3">
                                        {[
                                            "Keep your answers concise and direct.",
                                            "Ensure your answers match your documents.",
                                            "Maintain a calm and professional tone."
                                        ].map((tip, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="history-section">
                            <InterviewHistory />
                        </div>
                    </div>
                )}

                {step === "interview" && (
                    <InterviewSession
                        questions={selectedQuestions}
                        context={interviewContext}
                        onComplete={handleComplete}
                    />
                )}

                {step === "complete" && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-primary font-black">AI</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Analyzing Performance</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Our AI is reviewing your responses for clarity and consistency...</p>
                        </div>
                    </div>
                )}

                {step === "feedback" && (
                    <div className="max-w-4xl mx-auto">
                        <InterviewFeedback
                            interview={{
                                id: "current-session",
                                date: new Date().toISOString(),
                                destination: interviewContext?.destination,
                                visaType: interviewContext?.visaType,
                                feedback: sessionFeedback ?? undefined,
                            }}
                            onRestart={() => {
                                setSessionFeedback(null)
                                setStep("setup")
                            }}
                        />
                    </div>
                )}

            </div>
        </main>
    )
}
