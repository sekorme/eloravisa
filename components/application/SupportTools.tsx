// components/visa/SupportTools.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Mic, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SupportTools() {
    return (
        <Card className="p-8 space-y-8 bg-white dark:bg-slate-950 border-none shadow-2xl rounded-3xl relative overflow-hidden group">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-125" />
            
            <div className="relative z-10 space-y-6">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                        Premium Tools
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Unlock high-performance <span className="text-blue-600 dark:text-blue-400 font-bold">AI guidance</span> to secure your visa.
                    </p>
                </div>

                <div className="grid gap-4">
                    {[
                        { label: "AI Document Review", icon: Bot, color: "text-purple-600 bg-purple-500/10 dark:text-purple-400 border-purple-500/20", href: "/dashboard/review" },
                        { label: "AI Mock Interview", icon: Mic, color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20", href: "/dashboard/ai-mock-interview" },
                        { label: "Telegram Guidance", icon: Send, color: "text-blue-600 bg-blue-500/10 dark:text-blue-400 border-blue-500/20", href: "#" },
                    ].map((tool) => (
                        <Link href={tool.href} key={tool.label} className="block group/item">
                            <div className="flex items-center justify-between w-full h-16 px-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 transition-all group-hover/item:border-blue-500/50 group-hover/item:bg-white dark:group-hover/item:bg-white/10 group-hover/item:shadow-xl group-hover/item:shadow-blue-500/10 group-hover/item:-translate-y-1">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl border ${tool.color} shadow-sm transition-transform group-hover/item:rotate-6`}>
                                        <tool.icon size={20} />
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{tool.label}</span>
                                </div>
                                <ArrowRight size={18} className="text-slate-300 group-hover/item:text-blue-500 group-hover/item:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Card>
    );
}
