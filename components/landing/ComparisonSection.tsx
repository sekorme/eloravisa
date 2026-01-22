"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check, X } from "lucide-react"
import {AnimatedGridPattern} from "@/components/ui/animated-grid-pattern";
import {cn} from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger)

export function ComparisonSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".comparison-content", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out"
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative py-16 md:py-24">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
          <p className="text-muted-foreground text-lg">We don’t touch your application. We empower you.</p>
        </div>

        <div className="comparison-content bg-background rounded-2xl shadow-lg border overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-4 font-bold text-sm md:text-base">
            <div className="col-span-1"></div>
            <div className="col-span-1 text-center text-red-500">Visa Agents</div>
            <div className="col-span-1 text-center text-blue-600 dark:text-blue-400">Elora Visa</div>
          </div>

          <div className="divide-y">
              <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="font-medium text-sm md:text-base">Cost</div>
                  <div className="text-center text-sm text-muted-foreground">High processing fees</div>
                  <div className="text-center font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> No processing fee
                  </div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="font-medium text-sm md:text-base">Visa Interview Guide</div>
                  <div className="text-center text-sm text-muted-foreground">No preparation for visa interview</div>
                  <div className="text-center font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> We prepare you for visa interview
                  </div>
              </div>
            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="font-medium text-sm md:text-base">Process</div>
              <div className="text-center text-sm text-muted-foreground">Apply for you</div>
              <div className="text-center font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Teach you to apply
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="font-medium text-sm md:text-base">Transparency</div>
              <div className="text-center text-sm text-muted-foreground">Hide information</div>
              <div className="text-center font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Full transparency
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="font-medium text-sm md:text-base">Risk</div>
              <div className="text-center text-sm text-muted-foreground">High risk if wrong</div>
              <div className="text-center font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Learn before submitting
              </div>
            </div>

            <div className="grid grid-cols-3 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="font-medium text-sm md:text-base">Outcome</div>
              <div className="text-center text-sm text-muted-foreground">No skill gained</div>
              <div className="text-center font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Knowledge forever
              </div>
            </div>
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
                "inset-x-0 inset-y-[-30%] h-[100%] skew-y-12"
            )}
        />
    </section>
  )
}
