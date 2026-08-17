"use client"

import React, { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { UserPlus, ListChecks, Bot, Send, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTilt } from "@/hooks/useTilt"

gsap.registerPlugin(ScrollTrigger)

const steps = [
    {
        icon: UserPlus,
        title: "Create an account",
        desc: "Answer a few questions so we understand your visa goal.",
        color: "from-blue-500 to-cyan-500",
        shadow: "shadow-blue-500/20"
    },
    {
        icon: ListChecks,
        title: "Follow your checklist",
        desc: "Country‑specific requirements explained simply.",
        color: "from-indigo-500 to-purple-500",
        shadow: "shadow-indigo-500/20"
    },
    {
        icon: Bot,
        title: "Use AI tools",
        desc: "Document reviews & mock interviews to reduce mistakes.",
        color: "from-fuchsia-500 to-pink-500",
        shadow: "shadow-fuchsia-500/20"
    },
    {
        icon: Send,
        title: "Apply with confidence",
        desc: "You submit your application yourself.",
        color: "from-emerald-500 to-teal-500",
        shadow: "shadow-emerald-500/20"
    }
]

function StepCard({ step, index }: { step: (typeof steps)[number]; index: number }) {
    const tiltRef = useTilt<HTMLDivElement>({ max: 5, scale: 1.015 })

    return (
        <div className="step-card group relative">
            {/* Connector Arrow (Desktop) */}
            {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/4 -right-6 z-20 translate-x-1/2">
                    <ChevronRight className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse" />
                </div>
            )}

            <div
                ref={tiltRef}
                className={cn(
                    "h-full p-8 rounded-[2.5rem] transition-shadow duration-500",
                    "bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50",
                    "hover:shadow-2xl",
                    step.shadow
                )}
            >
                {/* Step Number */}
                <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 dark:text-slate-800/50">
                    0{index + 1}
                </div>

                {/* Icon */}
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br shadow-lg transform group-hover:rotate-12 transition-transform duration-500",
                    step.color
                )}>
                    <step.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                    {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                </p>
            </div>
        </div>
    )
}

export function HowItWorksSection() {
    const containerRef = useRef<HTMLDivElement>(null)

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])


    // GSAP Parallax and Entrance
    useEffect(() => {
        if (!mounted) return
        const ctx = gsap.context(() => {
            // Parallax background
            gsap.to(".how-it-works-bg", {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            })

            // Staggered cards
            gsap.from(".step-card", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".steps-grid",
                    start: "top 80%",
                }
            })

            // Title parallax
            gsap.to(".section-title", {
                y: -50,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            })
        }, containerRef)

        return () => ctx.revert()
    }, [mounted])

    if (!mounted) return <section id="how-it-works" className="py-24" />

    return (
        <section 
            id="how-it-works" 
            ref={containerRef} 
            className="relative py-24 md:py-32 overflow-hidden bg-[#f8fafc] dark:bg-[#050510]"
        >

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-20 section-title">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent ">
                            How{" "}
                        </span>
                        <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
                            It Works
                        </span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                        A simple, transparent process designed to empower you with 
                        everything you need for a successful application.
                    </p>
                </div>

                <div className="steps-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <StepCard key={index} step={step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}
