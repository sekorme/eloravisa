"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Brain, Mic, FileText, MessageCircle } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Brain,
    title: "AI Document Review",
    desc: "Detect red flags, missing info, and weak explanations before you submit.",
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    icon: Mic,
    title: "AI Visa Mock Interview",
    desc: "Practice real embassy questions and get scored feedback on your answers.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: FileText,
    title: "Step‑by‑Step Guidance",
    desc: "No confusion. No guesswork. Just a clear path to your application.",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: MessageCircle,
    title: "Telegram Support",
    desc: "Live guidance, reminders, and community support for paid users.",
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  }
]

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent ">
                Powerful{" "}
                <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
              Features
            </span>
            </h2>
          <p className="text-muted-foreground text-lg">Everything you need to build a strong application.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="feature-card flex items-start p-6 bg-background rounded-xl shadow-sm border hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-5 flex-shrink-0 ${feature.bg} ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
