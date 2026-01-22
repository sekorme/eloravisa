// components/visa/ApplicationProgress.tsx
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ApplicationProgress() {
    return (
        <Card className="p-6 space-y-4 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm">
            <div className="flex justify-between items-end mb-1">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Overall Progress</h3>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">
                        You’ve completed 3 out of 5 key requirements.
                    </p>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">60%</span>
            </div>
            <Progress value={60} className="h-2 bg-slate-100 dark:bg-slate-800" />
        </Card>
    );
}
