"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowRight, MessageSquareQuote, Sparkles, CheckCircle2, Landmark } from "lucide-react"
import { analyzeAnswer } from "@/action/interview"
import { auth } from "@/firebase/client"
import { toast } from "sonner"

export interface AnswerAnalysis {
    feedback: string
    score: number
    better_answer: string
}

export interface QAResult {
    question: string
    answer: string
    analysis: AnswerAnalysis | null
}

interface InterviewSessionProps {
    questions: string[]
    context: {
        name?: string
        destination?: string
        visaType?: string
    } | null
    onComplete: (results: QAResult[]) => void
}

export function InterviewSession({ questions, context, onComplete }: InterviewSessionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [results, setResults] = useState<QAResult[]>([])
    const [currentAnalysis, setCurrentAnalysis] = useState<AnswerAnalysis | null>(null)
    // "answering" = textarea visible; "reviewing" = per-answer feedback shown
    const [phase, setPhase] = useState<"answering" | "reviewing">("answering")

    const question = questions[currentIndex]
    const isLast = currentIndex === questions.length - 1

    const handleSubmit = async () => {
        const trimmed = answer.trim()
        if (!trimmed || submitting) return

        setSubmitting(true)
        let analysis: AnswerAnalysis | null = null
        try {
            const idToken = await auth.currentUser?.getIdToken()
            if (idToken) {
                const response = await analyzeAnswer(idToken, question, trimmed)
                if (response.success) {
                    analysis = response.data as AnswerAnalysis
                }
            }
        } catch (err) {
            console.warn("Answer analysis failed:", err)
        }
        if (!analysis) {
            // The interview must survive a failed analysis (rate limit, model
            // hiccup) — record the answer without a score and keep going.
            toast.warning("Couldn't analyze this answer — moving on.")
        }

        setResults(prev => [...prev, { question, answer: trimmed, analysis }])
        setCurrentAnalysis(analysis)
        setSubmitting(false)

        if (analysis) {
            setPhase("reviewing")
        } else {
            advance([...results, { question, answer: trimmed, analysis }])
        }
    }

    const handleNext = () => {
        advance(results)
    }

    const advance = (allResults: QAResult[]) => {
        if (isLast) {
            onComplete(allResults)
            return
        }
        setCurrentIndex(i => i + 1)
        setAnswer("")
        setCurrentAnalysis(null)
        setPhase("answering")
    }

    const scoreColor = (score: number) =>
        score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500"

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress header */}
            <div className="space-y-3 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                            <Landmark size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {context?.destination ? `${context.destination} Visa Interview` : "Visa Interview"}
                            </h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                {context?.visaType ? `${context.visaType} Visa · ` : ""}Question {currentIndex + 1} of {questions.length}
                            </p>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-primary tabular-nums">
                        {currentIndex + 1}/{questions.length}
                    </div>
                </div>
                <Progress value={((currentIndex + (phase === "reviewing" ? 1 : 0)) / questions.length) * 100} className="h-2" />
            </div>

            {/* Question card */}
            <Card className="border-none shadow-xl bg-white dark:bg-card overflow-hidden">
                <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/15 text-primary shrink-0">
                            <MessageSquareQuote size={22} />
                        </div>
                        <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-900 dark:text-white pt-1">
                            {question}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-6 md:p-8 space-y-6">
                    {phase === "answering" ? (
                        <>
                            <Textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Answer as you would in front of the visa officer…"
                                disabled={submitting}
                                rows={6}
                                className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-base p-4 resize-none focus-visible:ring-2 focus-visible:ring-primary/30"
                            />
                            <Button
                                onClick={handleSubmit}
                                disabled={!answer.trim() || submitting}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all gap-3 border-none"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Officer is considering your answer…
                                    </>
                                ) : (
                                    <>
                                        Submit Answer <ArrowRight size={20} />
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-5">
                            {/* The applicant's answer */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your answer</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                    {results[results.length - 1]?.answer}
                                </p>
                            </div>

                            {currentAnalysis && (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className={`text-4xl font-black tabular-nums ${scoreColor(currentAnalysis.score)}`}>
                                            {currentAnalysis.score}%
                                        </div>
                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${currentAnalysis.score >= 70 ? "bg-emerald-500" : currentAnalysis.score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                                style={{ width: `${Math.min(100, Math.max(0, currentAnalysis.score))}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={14} className="text-primary" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Officer&apos;s read</p>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                            {currentAnalysis.feedback}
                                        </p>
                                    </div>

                                    {currentAnalysis.better_answer && (
                                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">A stronger answer</p>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                                {currentAnalysis.better_answer}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            <Button
                                onClick={handleNext}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all gap-3 border-none"
                            >
                                {isLast ? "Finish Interview" : "Next Question"} <ArrowRight size={20} />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">
                Answer every question — the session is scored at the end
            </p>
        </div>
    )
}
