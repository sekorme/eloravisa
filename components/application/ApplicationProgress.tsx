"use client";

import { Progress } from "@/components/ui/progress";
import { useReadiness } from "@/hooks/useReadiness";

/**
 * The same readiness score and document counts as the dashboard
 * (lib/visaReadiness.ts), so the two pages never disagree. Needs
 * DashboardDataProvider (the application page wraps itself in one).
 */
export default function ApplicationProgress() {
    const { readiness, loading } = useReadiness();

    if (loading) {
        return <div className="h-[132px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>;
    }

    const total = readiness.uploadedRequired + readiness.missing.length;

    return (
        <div className="rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Interview readiness</h3>
                    <p className="text-sm text-lp-muted">
                        <span className="font-semibold text-lp-fg">{readiness.uploadedRequired}</span> of {total} required documents uploaded
                        {" · "}
                        <span className="font-semibold text-lp-fg">{readiness.reviewedRequired}</span> reviewed by AI
                    </p>
                </div>
                <span className="font-display text-4xl font-semibold tracking-[-0.05em]">
                    {readiness.score}<span className="text-xl text-lp-muted">%</span>
                </span>
            </div>
            <Progress value={readiness.score} className="h-2 bg-lp-sky [&_[data-slot=progress-indicator]]:bg-lp-azure [&_[data-slot=progress-indicator]]:rounded-full" />
        </div>
    );
}
