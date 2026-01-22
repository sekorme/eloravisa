"use client"

import { CheckCircle, AlertTriangle, FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function ReviewDetails({ reviewData }: { reviewData: any }) {
    if (!reviewData) return null

    return (
        <div className="space-y-6">
            {/* Score */}
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <div>
                    <h3 className="font-semibold text-lg">AI Review Score</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-blue-600">{reviewData.score}/100</div>
                    <div className="w-16">
                        <Progress value={reviewData.score} className="h-2" />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-500">
                    <FileText className="w-4 h-4" /> Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                    {reviewData.summary}
                </p>
            </div>

            {/* Analysis Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                        {reviewData.strengths?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                    </h4>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
                        {reviewData.weaknesses?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Risk Flags */}
            {reviewData.risk_flags?.length > 0 && (
                <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl">
                    <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Risk Flags
                    </h4>
                    <ul className="text-sm space-y-1 list-disc pl-5 text-red-700 dark:text-red-300">
                        {reviewData.risk_flags.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
