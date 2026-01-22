"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, RefreshCcw, LayoutDashboard, ThumbsUp, FileText } from "lucide-react"
import Link from "next/link"

export type Feedback = {
  scores?: {
    clarity?: number
    consistency?: number
    confidence?: number
    overall?: number
    [key: string]: number | undefined
  }
  summary?: string
  strengths?: string[]
  weaknesses?: string[]
  recommendations?: string[]
}

export interface InterviewFeedbackProps {
  onRestart: () => void
  interview?: {
    id: string
    date?: string
    destination?: string
    visaType?: string
    feedback?: Feedback
  }
}

export function InterviewFeedback({ onRestart, interview }: InterviewFeedbackProps) {
  const fb = (interview?.feedback ?? {}) as Feedback
  const scores = fb.scores ?? {}
  const strengths = fb.strengths ?? []
  const weaknesses = fb.weaknesses ?? []
  const recommendations = fb.recommendations ?? []

  return (
    <div className="space-y-8">
      {/* Hero Score Card */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        
        <CardHeader className="text-center pb-2 relative z-10">
            <div className="flex justify-center mb-6">
                <div className="p-4 rounded-3xl bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 animate-bounce-slow">
                    <div className="text-5xl font-black">{scores.overall ?? 0}%</div>
                </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight mb-2">Interview Analysis</CardTitle>
            <p className="text-blue-100 text-lg font-medium opacity-90 max-w-2xl mx-auto">
                {fb.summary || "You have completed your AI-guided practice session. Here is your performance breakdown."}
            </p>
        </CardHeader>

        <CardContent className="pt-6 pb-10 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                  {[
                      { label: "Clarity", key: 'clarity', color: "bg-blue-400" },
                      { label: "Consistency", key: 'consistency', color: "bg-indigo-400" },
                      { label: "Confidence", key: 'confidence', color: "bg-emerald-400" },
                  ].map((stat) => {
                      const value = scores[stat.key] ?? 0
                      return (
                        <div key={stat.label} className="text-center space-y-2 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <div className="text-2xl md:text-3xl font-black tracking-tighter">{value}%</div>
                            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-blue-100 opacity-80">{stat.label}</div>
                            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden mt-2">
                                <div className={`${stat.color} h-full`} style={{ width: `${value}%` }} />
                            </div>
                        </div>
                      )
                  })}
              </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card className="border-none shadow-lg bg-white dark:bg-card overflow-hidden h-full">
            <CardHeader className="pb-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                        <ThumbsUp size={20} />
                    </div>
                    <h3 className="font-black text-emerald-900 dark:text-emerald-100 uppercase text-xs tracking-widest">Key Strengths</h3>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {strengths.length > 0 ? strengths.map((item, i) => (
                     <div key={i} className="flex items-start gap-3">
                         <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                         <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</p>
                     </div>
                 )) : (
                    <p className="text-sm text-slate-500 italic">No specific strengths highlighted.</p>
                 )}
            </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-none shadow-lg bg-white dark:bg-card overflow-hidden h-full">
            <CardHeader className="pb-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-black text-amber-900 dark:text-amber-100 uppercase text-xs tracking-widest">Areas for Improvement</h3>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {weaknesses.length > 0 ? weaknesses.map((item, i) => (
                     <div key={i} className="flex items-start gap-3">
                         <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                         <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</p>
                     </div>
                 )) : (
                    <p className="text-sm text-slate-500 italic">No major weaknesses detected.</p>
                 )}
            </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-none shadow-xl bg-white dark:bg-card overflow-hidden">
            <CardHeader className="pb-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <Lightbulb size={20} />
                    </div>
                    <h3 className="font-black text-blue-900 dark:text-blue-100 uppercase text-xs tracking-widest">Actionable Recommendations</h3>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {recommendations.length > 0 ? recommendations.map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                            {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed pt-1.5">
                            {item}
                        </p>
                    </div>
                )) : (
                    <p className="text-sm text-slate-500 italic">No specific recommendations provided.</p>
                )}
            </CardContent>
        </Card>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-2xl mx-auto w-full">
        <Button 
            variant="outline" 
            className="flex-1 h-16 font-black border-slate-200 dark:border-slate-800 gap-3 active:scale-95 transition-all rounded-2xl text-lg shadow-sm hover:shadow-md"
            onClick={onRestart}
        >
            <RefreshCcw size={22} className="text-blue-600" />
            Practice Again
        </Button>
        <Button 
            className="flex-1 h-16 bg-blue-600 hover:bg-blue-700 text-white font-black gap-3 shadow-xl shadow-blue-500/30 active:scale-95 transition-all border-none rounded-2xl text-lg"
            asChild
        >
            <Link href="/dashboard/application">
                <LayoutDashboard size={22} />
                Back to Dashboard
            </Link>
        </Button>
      </div>

      <p className="text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] px-6 py-4">
        Educational practice only. Final decisions are made exclusively by embassy officers.
      </p>
    </div>
  )
}
