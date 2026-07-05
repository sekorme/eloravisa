"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import {
    User,
    AlertTriangle,
    GraduationCap,
    Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const audiences = [
    {
        icon: User,
        image: "/firsttime.png",
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
        image: "/pastrefusal.png",
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
        image: "/studentworker.png",
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
        image: "/tiredofagent.png",
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
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                duration: 0.8, 
                ease: [0.34, 1.56, 0.64, 1] // Custom back.out easing
            } 
        }
    }

    const titleVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.02
            }
        }
    }

    const charVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    }

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="relative py-24 md:py-40 bg-background overflow-hidden"
        >
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-24 section-header">
                    <motion.div 
                        variants={itemVariants}
                        className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-blue-100/50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800 mb-6 section-subtitle"
                    >
                        Who We Support
                    </motion.div>
                    <motion.h2 
                        variants={titleVariants}
                        className="section-title text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white"
                    >
                        {"Designed For Every Journey".split("").map((char, index) => (
                            <motion.span
                                key={index}
                                variants={charVariants}
                                className="inline-block whitespace-pre"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.h2>
                    <motion.p 
                        variants={itemVariants}
                        className="section-subtitle text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Whether you&apos;re starting fresh or recovering from a setback, we provide the tools you need to succeed.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {audiences.map((item, index) => {
                        return (
                            <motion.div 
                                key={index} 
                                variants={cardVariants}
                                className="audience-card group relative"
                            >
                                <div className={cn(
                                    "relative h-full overflow-hidden rounded-[2.5rem] border p-8 md:p-10 transition-all duration-500",
                                    "bg-white dark:bg-slate-900/50 backdrop-blur-sm",
                                    "border-slate-200 dark:border-slate-800",
                                    "hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2",
                                    "group-hover:border-blue-500/30"
                                )}>
                                    {/* Card Gradient Overlay */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br",
                                        item.color,
                                        "to-transparent"
                                    )} />

                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-start gap-8">
                                            {/* Icon & Title Area */}
                                            <div className="flex-1">
                                                <div className={cn(
                                                    "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8",
                                                    "shadow-lg transition-transform duration-500 group-hover:rotate-6",
                                                    item.iconBg,
                                                    item.iconColor
                                                )}>
                                                    <item.icon size={32} />
                                                </div>
                                                
                                                <h3 className="text-2xl md:text-3xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">
                                                    {item.title}
                                                </h3>
                                                
                                                <h4 className={cn(
                                                    "text-lg font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent",
                                                    "from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
                                                )}>
                                                    {item.subtitle}
                                                </h4>

                                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg font-medium">
                                                    {item.desc}
                                                </p>
                                            </div>

                                            {/* Visual Area */}
                                            <div className="w-full md:w-48 lg:w-56 aspect-square relative shrink-0">
                                                <div className={cn(
                                                    "absolute inset-0 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full",
                                                    item.color
                                                )} />
                                                
                                                <div className={cn(
                                                    "relative h-full w-full rounded-3xl border-2 overflow-hidden",
                                                    "bg-slate-100 dark:bg-slate-800",
                                                    item.borderColor,
                                                    "shadow-inner"
                                                )}>
                                                    <Image 
                                                        src={item.image} 
                                                        alt={item.title} 
                                                        fill 
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </motion.section>
    )
}
