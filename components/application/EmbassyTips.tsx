// components/visa/EmbassyTips.tsx
import { Card } from "@/components/ui/card";
import { Lightbulb, Info } from "lucide-react";

export default function EmbassyTips({ country }: { country: string }) {
    return (
        <Card className="p-8 bg-white dark:bg-slate-950 border-none shadow-2xl relative overflow-hidden rounded-3xl group">
            {/* Animated background accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                        <Lightbulb size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white tracking-tight">
                            Embassy Insider
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500">
                            Target: {country}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    {[
                        "Clearly explain source of funds with verified documentation",
                        "Avoid generic SOP templates; personalize your motivation",
                        "Ensure sponsor documents match bank statements perfectly"
                    ].map((tip, i) => (
                        <div key={i} className="flex items-start gap-4 group/tip">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover/tip:scale-150 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed group-hover/tip:text-slate-900 dark:group-hover/tip:text-white transition-colors">
                                {tip}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                    <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                        Based on common refusal patterns and successful applications. Not an official guarantee.
                    </p>
                </div>
            </div>
        </Card>
    );
}
