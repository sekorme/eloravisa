"use client"

import { useState, useEffect, useRef } from "react"
import { InterviewSetup } from "@/components/interview/InterviewSetup"

import { InterviewFeedback } from "@/components/interview/InterviewFeedback"
import { InterviewHistory } from "@/components/interview/InterviewHistory"
import { gsap } from "gsap"
import { Mic } from "lucide-react"

export default function MockVisaInterviewPage() {
    const [step, setStep] = useState<"setup" | "interview" | "complete" | "feedback">("setup")
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
    const [isVoiceMode, setIsVoiceMode] = useState(false)
    const [interviewContext, setInterviewContext] = useState<any>(null)
    const [interviewResults, setInterviewResults] = useState<any[]>([])
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

    const startInterview = (questions: string[], voiceMode: boolean, contextData: any) => {
        setSelectedQuestions(questions)
        setIsVoiceMode(voiceMode)
        setInterviewContext(contextData)
        setStep("interview")
    }

    const handleComplete = (results: any[]) => {
        setInterviewResults(results)
        setStep("complete")
        // Simulate a small delay before showing feedback for "AI Analysis" feel
        setTimeout(() => setStep("feedback"), 1500)
    }

    return (
        <main className="min-h-screen p-2 md:p-6 w-full">
            <div ref={containerRef} className="max-w-5xl mx-auto space-y-8 main-content">

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
                                <div className="p-6 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold mb-2">Ready to Shine?</h3>
                                    <p className="text-blue-100 text-sm mb-4 leading-relaxed">
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
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
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



                {step === "complete" && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-blue-600 font-black">AI</span>
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
                            // @ts-ignore - passing results even if component doesn't define them yet
                            results={interviewResults}
                            onRestart={() => setStep("setup")}
                        />
                    </div>
                )}

            </div>
        </main>
    )
}
