// components/visa/SupportTools.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Mic, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SupportTools() {
    return (
        <Card className="p-6 space-y-4 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Premium Support</h3>
            <p className="text-sm text-slate-500 dark:text-muted-foreground">Unlock your full potential with our AI-powered guidance tools.</p>

            <div className="grid gap-3">
                {[
                    { label: "AI Document Review", icon: Bot, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400", href: "/dashboard/review" },
                    { label: "AI Mock Interview", icon: Mic, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400", href: "/dashboard/ai-mock-interview" },
                    { label: "Telegram Guidance", icon: Send, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400", href: "#" },
                ].map((tool) => (
                    <Link href={tool.href} key={tool.label} className="block group">
                        <Button 
                            variant="outline" 
                            className="w-full justify-between h-14 px-4 hover:bg-slate-50 dark:hover:bg-slate-900 group-hover:border-blue-500/50 transition-all"
                            asChild
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tool.color}`}>
                                        <tool.icon size={18} />
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-200">{tool.label}</span>
                                </div>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Button>
                    </Link>
                ))}
            </div>
        </Card>
    );
}
