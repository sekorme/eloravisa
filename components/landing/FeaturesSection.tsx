"use client"

import React, { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Brain, Mic, FileText, MessageCircle, Sparkles, ShieldCheck, Zap, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Brain,
    title: "AI Document Review",
    desc: "Our advanced AI scans your documents to detect red flags, missing information, and weak explanations before you submit to the embassy.",
    color: "from-purple-500 to-indigo-600",
    iconColor: "text-purple-500",
    bg: "bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/50"
  },
  {
    icon: Mic,
    title: "AI Visa Mock Interview",
    desc: "Practice with real embassy-style questions and get scored feedback on your tone, content, and confidence to ace the real thing.",
    color: "from-blue-500 to-cyan-600",
    iconColor: "text-blue-500",
    bg: "bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50"
  },
  {
    icon: FileText,
    title: "Step‑by‑Step Guidance",
    desc: "No more confusion or guesswork. We provide a clear, personalized roadmap from your initial idea to the final visa approval.",
    color: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-500",
    bg: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/50"
  },
  {
    icon: MessageCircle,
    title: "Telegram Support",
    desc: "Join our exclusive community for live guidance, important reminders, and expert support whenever you feel stuck in your journey.",
    color: "from-orange-500 to-amber-600",
    iconColor: "text-orange-500",
    bg: "bg-orange-500/10",
    borderColor: "group-hover:border-orange-500/50"
  },
  {
    icon: ShieldCheck,
    title: "Secure Data Protection",
    desc: "We prioritize your privacy with end-to-end encryption and industry-standard security protocols for all your sensitive documents.",
    color: "from-red-500 to-pink-600",
    iconColor: "text-red-500",
    bg: "bg-red-500/10",
    borderColor: "group-hover:border-red-500/50"
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Supporting visa applications for over 190 countries worldwide with localized expert knowledge and up-to-date policy tracking.",
    color: "from-cyan-500 to-blue-600",
    iconColor: "text-cyan-500",
    bg: "bg-cyan-500/10",
    borderColor: "group-hover:border-cyan-500/50"
  }
]

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  // GSAP Entrance Animations
  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          toggleActions: "play none none none"
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)",
        clearProps: "all"
      })
      
      gsap.from(".section-header", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          toggleActions: "play none none none"
        },
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  return (
    <section 
      ref={containerRef} 
      className="relative py-24 md:py-32 overflow-hidden bg-[#f8fafc] dark:bg-[#050510]"
    >

      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative px-4 mx-auto z-10">
        <div className="section-header text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Cutting-edge Technology
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Powerful{" "}
            </span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to build a rock-solid visa application, powered by 
            intelligent automation and expert logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={cn(
                "group feature-card relative flex flex-col items-start p-8 rounded-[2rem]",
                "bg-white/40 dark:bg-white/5 backdrop-blur-xl",
                "border border-slate-200/50 dark:border-white/10",
                "hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500",
                "relative z-20",
                "overflow-hidden"
              )}
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                feature.bg, feature.iconColor
              )}>
                <feature.icon className="w-8 h-8" />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  {feature.desc}
                </p>
                
                <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Learn how it works
                  <Zap className="w-4 h-4 ml-2 fill-current" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-24 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold">Secure Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span className="font-semibold">190+ Countries</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI Powered</span>
          </div>
        </div>
      </div>
    </section>
  )
}
