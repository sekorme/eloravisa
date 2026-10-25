// components/visa/SupportTools.tsx
import { Bot, Mic, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SupportTools() {
    return (
        <div className="relative overflow-hidden rounded-[1.5rem] bg-lp-navy p-6 text-white md:p-7 lp-shadow">
            <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
            <div className="relative z-10 space-y-6">
                <div>
                    <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">AI guidance</span>
                    <h3 className="mt-2 font-display text-2xl font-semibold leading-none tracking-[-0.04em]">
                        Premium Tools
                    </h3>
                    <p className="mt-3 text-sm text-white/70">
                        Unlock high-performance <span className="font-semibold text-[#8FCDAF]">AI guidance</span> to secure your visa.
                    </p>
                </div>

                <div className="grid gap-2.5">
                    {[
                        { label: "AI Document Review", icon: Bot, href: "/dashboard/review" },
                        { label: "AI Mock Interview", icon: Mic, href: "/dashboard/ai-mock-interview" },
                        { label: "Telegram Guidance", icon: Send, href: "#" },
                    ].map((tool) => (
                        <Link
                            href={tool.href}
                            key={tool.label}
                            className="group/item flex h-14 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] pl-2 pr-4 transition-colors hover:border-white/25 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FCDAF]"
                        >
                            <span className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#8FCDAF] transition-transform group-hover/item:-rotate-6">
                                    <tool.icon size={18} />
                                </span>
                                <span className="font-semibold tracking-tight">{tool.label}</span>
                            </span>
                            <ArrowRight size={16} className="text-white/40 transition-[color,transform] group-hover/item:translate-x-1 group-hover/item:text-white" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
