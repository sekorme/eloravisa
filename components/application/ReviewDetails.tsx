"use client"

import { CheckCircle, AlertTriangle, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function ReviewDetails({ reviewData }: { reviewData: any }) {
    if (!reviewData) return null

    return (
        <div className="space-y-6">
            {/* Score */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-lp-navy p-5 text-white">
                <div>
                    <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">AI Review Score</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="font-display text-3xl font-semibold tracking-[-0.04em]">{reviewData.score}<span className="text-base text-white/50">/100</span></div>
                    <div className="w-16">
                        <Progress value={reviewData.score} className="h-1.5 bg-white/15 [&>*]:bg-[#8FCDAF]" />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <h4 className="mb-2 flex items-center gap-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">
                    <FileText className="h-3.5 w-3.5" /> Summary
                </h4>
                <p className="rounded-xl border border-lp-line bg-lp-card-2 p-4 text-sm leading-relaxed text-lp-muted">
                    {reviewData.summary}
                </p>
            </div>

            {/* Analysis Grid */}
            <div className="grid gap-3 md:grid-cols-2">
                {/* Strengths */}
                <div className="space-y-2 rounded-xl border border-lp-line p-4">
                    <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-lp-azure">
                        <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-lp-muted">
                        {reviewData.strengths?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="space-y-2 rounded-xl border border-lp-line p-4">
                    <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                    </h4>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-lp-muted">
                        {reviewData.weaknesses?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Risk Flags */}
            {reviewData.risk_flags?.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-400/20 dark:bg-red-400/[0.06]">
                    <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-red-700 dark:text-red-300">
                        <AlertTriangle className="w-4 h-4" /> Risk Flags
                    </h4>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-red-900/80 dark:text-red-200/80">
                        {reviewData.risk_flags.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
