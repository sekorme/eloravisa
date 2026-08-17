"use client"

import React, { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, X, Minus, Sparkles, ShieldCheck, Zap, Users, Globe, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const comparisonData = [
  {
    feature: "Cost Efficiency",
    agent: "High processing fees ($500+)",
    elora: "Zero processing fees. Pay only for what you need.",
    icon: Zap,
    color: "blue"
  },
  {
    feature: "Interview Mastery",
    agent: "Generic tips or no preparation at all",
    elora: "Unlimited AI-Powered Mock Interviews with real-time feedback.",
    icon: Sparkles,
    color: "cyan"
  },
  {
    feature: "Full Ownership",
    agent: "They apply for you (Complete Black box)",
    elora: "We teach you the 'How' (Full Control & Empowerment).",
    icon: Users,
    color: "indigo"
  },
  {
    feature: "Radical Transparency",
    agent: "Information gatekeeping and hidden costs",
    elora: "100% transparency. No secrets, no hidden agendas.",
    icon: ShieldCheck,
    color: "emerald"
  },
  {
    feature: "Risk Mitigation",
    agent: "High risk of misrepresentation & errors",
    elora: "AI Document Review + Expert Strategy (Your Safety Net).",
    icon: Globe,
    color: "violet"
  },
  {
    feature: "Long-term Value",
    agent: "One-time service, dependent on agent",
    elora: "Lifelong skills to handle any future visa needs yourself.",
    icon: BookOpen,
    color: "blue"
  }
]

export function ComparisonSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  useEffect(() => {
    if (!mounted || !containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(".comparison-title", {
        scrollTrigger: {
          trigger: ".comparison-title",
          start: "top 90%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      })

      gsap.from(".comparison-card", {
        scrollTrigger: {
          trigger: ".comparison-card",
          start: "top 95%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        clearProps: "all"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  if (!mounted) return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#f8fafc] dark:bg-[#050510] min-h-[600px]">
      <div className="container relative z-10 px-4 mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 text-slate-900 dark:text-white">
          Beyond the{" "}
          <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent italic">
            Traditional
          </span>
        </h2>
      </div>
    </section>
  )

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 overflow-hidden bg-[#f8fafc] dark:bg-[#050510]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] dark:bg-blue-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px] dark:bg-cyan-900/10" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="comparison-title text-center mb-20 md:mb-32">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 text-slate-900 dark:text-white">
            Beyond the{" "}
            <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent italic">
              Traditional
            </span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#00b7fa] to-[#01cfea] mx-auto mb-10 rounded-full" />
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed font-medium">
            We're not just an alternative; we're a complete evolution of the visa process.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {comparisonData.map((item, index) => {
              const Icon = item.icon
              return (
                <div 
                  key={index} 
                  className="comparison-card group relative p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:scale-[1.02] overflow-hidden"
                >
                  {/* Card Background Glow */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    "bg-[radial-gradient(circle_at_50%_0%,rgba(0,183,250,0.1),transparent_70%)]"
                  )} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className={cn(
                        "p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
                        "text-[#00b7fa]"
                      )}>
                        <Icon size={32} strokeWidth={2.5} />
                      </div>
                      <div className="flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.feature}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                      {/* Elora Visa - The Good */}
                      <div className="order-1 md:order-2">
                        <div className="flex items-center gap-2 mb-4 text-emerald-500">
                          <Check size={20} strokeWidth={3} />
                          <span className="font-black text-sm uppercase tracking-tighter">Elora Visa</span>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                          {item.elora}
                        </p>
                      </div>

                      {/* Traditional Agent - The Bad */}
                      <div className="order-2 md:order-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-4 text-rose-500">
                          <X size={20} strokeWidth={3} />
                          <span className="font-black text-sm uppercase tracking-tighter text-slate-500">Traditional Agents</span>
                        </div>
                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 italic">
                          {item.agent}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA or Summary */}
        <div className="mt-24 text-center">
          <p className="text-slate-500 dark:text-slate-500 font-bold tracking-widest uppercase text-sm mb-6">Experience the difference</p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg transition-transform hover:scale-105"
          >
            Start Your Journey <Sparkles size={20} className="text-yellow-400" />
          </a>
        </div>
      </div>
    </section>
  )
}
