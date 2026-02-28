"use client"

import React, { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
    User,
    AlertTriangle,
    GraduationCap,
    Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

const audiences = [
    {
        icon: User,
        title: "First-time Applicants",
        subtitle: "A smooth start to your new chapter.",
        desc: "The visa application process can be daunting, but it doesn't have to be. We simplify the complexities, providing a clear roadmap from your initial idea to your final approval. Our step-by-step guidance ensures you never miss a detail.",
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "border-blue-500/20 dark:border-blue-400/20",
        iconColor: "text-blue-500 dark:text-blue-400",
        iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
        shape: "icosahedron"
    },
    {
        icon: AlertTriangle,
        title: "Past Refusals",
        subtitle: "Turning setbacks into success.",
        desc: "A previous rejection isn't the end of the road. We specialize in analyzing refusal letters to identify exactly what went wrong. By addressing the root causes and strengthening your application strategy, we help you reapply with newfound confidence.",
        color: "from-amber-500/20 to-orange-500/20",
        borderColor: "border-amber-500/20 dark:border-amber-400/20",
        iconColor: "text-amber-500 dark:text-amber-400",
        iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
        shape: "torus"
    },
    {
        icon: GraduationCap,
        title: "Students & Workers",
        subtitle: "Bridging the gap to global opportunities.",
        desc: "Whether you're pursuing a degree or a career abroad, we provide specialized support for study permits and work visas. Our guidance is tailored to your unique goals, helping you navigate institutional requirements and international labor markets.",
        color: "from-indigo-500/20 to-purple-500/20",
        borderColor: "border-indigo-500/20 dark:border-indigo-400/20",
        iconColor: "text-indigo-500 dark:text-indigo-400",
        iconBg: "bg-indigo-500/10 dark:bg-indigo-400/10",
        shape: "octahedron"
    },
    {
        icon: Shield,
        title: "Tired of Agents",
        subtitle: "Take full control of your destiny.",
        desc: "Say goodbye to middlemen and hidden fees. We empower you with the knowledge and tools to handle your own application. Avoid misinformation and stay in the driver's seat of your immigration journey with total transparency.",
        color: "from-emerald-500/20 to-teal-500/20",
        borderColor: "border-emerald-500/20 dark:border-emerald-400/20",
        iconColor: "text-emerald-500 dark:text-emerald-400",
        iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
        shape: "sphere"
    },
]

export function TargetAudienceSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // GSAP Entrance Animations
    useEffect(() => {
        if (!mounted) return
        const ctx = gsap.context(() => {
            // Speed up the initial reveal and disable transitions during theme switch
            gsap.defaults({ overwrite: "auto" })

            gsap.utils.toArray<HTMLElement>(".audience-section").forEach((section, i) => {
                const isEven = i % 2 === 0
                const content = section.querySelector(".section-content")
                const visual = section.querySelector(".section-visual")

                gsap.from(content, {
                    x: isEven ? -50 : 50,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                })

                gsap.from(visual, {
                    x: isEven ? 50 : -50,
                    opacity: 0,
                    scale: 0.9,
                    duration: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 90%",
                        toggleActions: "play none none none"
                    },
                })
            })

            gsap.from(".section-header", {
                y: -30,
                opacity: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 95%",
                }
            })
        }, containerRef)

        return () => ctx.revert()
    }, [mounted])

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 bg-[#f8fafc] dark:bg-[#050510] overflow-hidden"
        >
            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-32 section-header">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6">
                        Who This Is{" "}
                        <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent italic">
                            For.
                        </span>
                    </h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-[#00b7fa] to-[#01cfea] mx-auto mb-8 rounded-full" />
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                        Empowering you to take charge of your journey. No agents, no hidden fees, just expert guidance for every stage.
                    </p>
                </div>

                <div className="space-y-32 md:space-y-48">
                    {audiences.map((item, index) => {
                        const isEven = index % 2 === 0
                        return (
                            <div 
                                key={index} 
                                className={cn(
                                    "audience-section flex flex-col md:flex-row items-center gap-12 md:gap-24",
                                    !isEven && "md:flex-row-reverse"
                                )}
                            >
                                {/* Text Content */}
                                <div className="section-content flex-1 text-center md:text-left">
                                    <div className={cn(
                                        "inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8",
                                        "shadow-2xl shadow-black/10 transition-transform duration-500 hover:rotate-12",
                                        item.iconBg,
                                        item.iconColor
                                    )}>
                                        <item.icon size={40} />
                                    </div>
                                    
                                    <h3 className="text-3xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">
                                        {item.title}
                                    </h3>
                                    
                                    <h4 className={cn(
                                        "text-xl md:text-2xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent",
                                        "from-slate-600 to-slate-400 dark:from-slate-300 dark:to-slate-500"
                                    )}>
                                        {item.subtitle}
                                    </h4>

                                    <p className="text-slate-600 dark:text-slate-400 leading-loose text-lg md:text-xl font-medium max-w-xl mx-auto md:mx-0">
                                        {item.desc}
                                    </p>

                                    <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
                                        <div className={cn(
                                            "h-1 w-12 rounded-full bg-gradient-to-r",
                                            item.color
                                        )} />
                                    </div>
                                </div>

                                {/* Visual Element */}
                                <div className="section-visual flex-1 relative flex justify-center items-center">
                                    <div className={cn(
                                        "absolute inset-0 blur-[100px] opacity-20 dark:opacity-30 rounded-full",
                                        item.color
                                    )} />
                                    
                                    <div className={cn(
                                        "relative z-10 w-full max-w-[400px] aspect-square rounded-[3rem] border-2",
                                        "bg-white/10 dark:bg-white/5 backdrop-blur-3xl flex items-center justify-center",
                                        item.borderColor,
                                        "shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.05)]"
                                    )}>
                                        <div className="text-center p-8">
                                            <div className={cn(
                                                "w-32 h-32 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br opacity-50 blur-xl absolute",
                                                item.color
                                            )} />
                                            <item.icon size={120} className={cn("relative z-10 opacity-80", item.iconColor)} />
                                        </div>
                                        
                                        {/* Abstract Floating Shapes */}
                                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-bounce [animation-duration:5s]" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
