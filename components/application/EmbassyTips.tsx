// components/visa/EmbassyTips.tsx
import { Card } from "@/components/ui/card";
import { Lightbulb, Info } from "lucide-react";

export default function EmbassyTips({ country }: { country: string }) {
    return (
        <Card className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20">
                <Lightbulb size={64} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800/50">
                    <Lightbulb size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                    Embassy Insider: {country}
                </h3>
            </div>

            <ul className="space-y-3 mb-6">
                {[
                    "Clearly explain source of funds with verified documentation",
                    "Avoid generic SOP templates; personalize your motivation",
                    "Ensure sponsor documents match bank statements perfectly"
                ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {tip}
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800/30">
                <Info size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70 font-medium">
                    These are based on common refusal patterns and successful applications, not official guarantees.
                </p>
            </div>
        </Card>
    );
}
