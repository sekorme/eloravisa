"use client";

import { Button } from "@/components/ui/button";
import { FeedbackCard } from "./FeedbackCard";
import { RefreshCcw, Mic, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AIReviewResults() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeedbackCard
                    title="Strengths"
                    icon="✅"
                    items={[
                        "Clear explanation of study goals",
                        "Consistent personal information",
                        "Strong academic background connection",
                    ]}
                />

                <FeedbackCard
                    title="Risk flags"
                    icon="⚠️"
                    items={[
                        "Funding source could be explained more clearly",
                        "Course relevance needs stronger connection",
                        "Potential gap in employment history",
                    ]}
                />

                <FeedbackCard
                    title="Missing elements"
                    icon="❌"
                    items={[
                        "Post-study career plan",
                        "Clear reason for choosing destination country",
                        "Declaration of previous visa refusals (if any)",
                    ]}
                />

                <FeedbackCard
                    title="Suggested improvements"
                    icon="✍️"
                    items={[
                        "Explain how this course fits your long-term career",
                        "Clarify sponsor relationship and income source",
                        "Quantify professional achievements more clearly",
                    ]}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 shadow-lg shadow-blue-500/20">
                    <RefreshCcw size={18} />
                    Re-upload improved document
                </Button>
                <Button variant="outline" className="flex-1 h-12 gap-2" asChild>
                    <Link href="/dashboard/application">
                        <Mic size={18} className="text-emerald-500" />
                        Practice mock interview
                    </Link>
                </Button>
                <Button variant="ghost" className="flex-1 h-12 gap-2" asChild>
                    <Link href="/dashboard/application">
                        <ArrowLeft size={18} />
                        Back to checklist
                    </Link>
                </Button>
            </div>
        </div>
    );
}
