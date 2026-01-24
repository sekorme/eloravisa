"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { UserPlus, ListChecks, Bot, Send } from "lucide-react"

import {AnimatedGridPattern} from "@/components/ui/animated-grid-pattern";
import {cn} from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    icon: UserPlus,
    title: "Create an account",
    desc: "Answer a few questions so we understand your visa goal."
  },
  {
    icon: ListChecks,
    title: "Follow your checklist",
    desc: "Country‑specific requirements explained simply."
  },
  {
    icon: Bot,
    title: "Use AI tools",
    desc: "Document reviews & mock interviews to reduce mistakes."
  },
  {
    icon: Send,
    title: "Apply with confidence",
    desc: "You submit your application yourself."
  }
]

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        x: -30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="how-it-works" ref={containerRef} className="relative py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent ">
            How{" "}
            <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
              It Works
            </span>
        </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A simple, transparent process designed to empower you.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="step-item flex flex-col items-center text-center bg-background md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none shadow-sm md:shadow-none border md:border-none">
                <div className="w-24 h-24 bg-white dark:bg-slate-950 border-4 border-blue-50 dark:border-blue-900/20 rounded-full flex items-center justify-center mb-6 relative z-10">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full border flex items-center justify-center font-bold text-sm shadow-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-2">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
    </section>
  )
}
