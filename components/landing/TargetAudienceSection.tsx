"use client"

import React, { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
    User,
    AlertTriangle,
    GraduationCap,
    Shield,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { AnimatedGridPattern } from "../ui/animated-grid-pattern"
import {cn} from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger)

const audiences = [
    {
        icon: User,
        title: "First-time Applicants",
        desc: "Navigate the complex process with confidence from day one.",
    },
    {
        icon: AlertTriangle,
        title: "Past Refusals",
        desc: "Understand what went wrong and fix your application strategy.",
    },
    {
        icon: GraduationCap,
        title: "Students & Workers",
        desc: "Tailored guidance for study permits and work visas.",
    },
    {
        icon: Shield,
        title: "Tired of Agents",
        desc: "Avoid misinformation and take full control of your destiny.",
    },
]

export function TargetAudienceSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [stack, setStack] = useState(audiences)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Card entrance animation
            gsap.from(".audience-card", {
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                },
            })

            // 🔹 Animated gradient (transform-based — reliable)
            gsap.to("#audience-gradient", {
                xPercent: 20,
                yPercent: -15,
                duration: 30,
                ease: "none",
                repeat: -1,
                yoyo: true,
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const swipe = (direction: "next" | "prev") => {
        const cards = gsap.utils.toArray<HTMLElement>(".audience-card")
        const topCard = cards[0]

        gsap.to(topCard, {
            x: direction === "next" ? -120 : 120,
            rotation: direction === "next" ? -8 : 8,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                gsap.set(topCard, { x: 0, rotation: 0, opacity: 1 })

                setStack((prev) => {
                    if (direction === "next") {
                        const [first, ...rest] = prev
                        return [...rest, first]
                    } else {
                        const last = prev[prev.length - 1]
                        return [last, ...prev.slice(0, -1)]
                    }
                })
            },
        })
    }

    return (
        <section
            ref={containerRef}
            className="relative py-24 md:py-32 bg-background/50 overflow-hidden"
        >
            <AnimatedGridPattern
                numSquares={30}
                maxOpacity={0.1}
                duration={3}
                repeatDelay={1}
                className={cn(
                    "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
                )}
            />



            <div className="container px-4 mx-auto relative z-0">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
                        Who This Is{" "}
                        <span className="text-primary">For.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        You stay in control. We guide, you apply.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    {/* Card Stack */}
                    <div className="relative w-full max-w-sm h-64">
                        {stack.map((item, index) => (
                            <Card
                                key={item.title}
                                className="audience-card absolute w-full h-full p-6 bg-background/60 dark:bg-background/40 backdrop-blur-lg border-2 border-white/20 rounded-2xl shadow-lg"
                                style={{
                                    transform: `rotateZ(${index * 2 - 3}deg) translateY(${index * -6}px)`,
                                    zIndex: stack.length - index,
                                }}
                            >
                                <CardContent className="p-0 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        <Button variant="outline" size="icon" onClick={() => swipe("prev") }>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => swipe("next") }>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
