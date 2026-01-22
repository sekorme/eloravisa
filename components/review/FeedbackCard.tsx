"use client";

import { Card } from "@/components/ui/card";

interface FeedbackCardProps {
    title: string;
    icon: string;
    items: string[];
}

export function FeedbackCard({ title, icon, items }: FeedbackCardProps) {
    return (
        <Card className="p-5 space-y-3 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">{icon}</span> {title}
            </h3>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
