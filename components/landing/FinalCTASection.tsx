"use client"

import React, { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SignupSheet } from "@/components/auth/SignupSheet"
import { Sparkles, ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export function FinalCTASection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  useEffect(() => {
    if (!mounted || !containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(".cta-box", {
        scrollTrigger: {
          trigger: ".cta-box",
          start: "top 85%",
        },
        y: 40,
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out"
      })

      gsap.from(".cta-elements", {
        scrollTrigger: {
          trigger: ".cta-box",
          start: "top 75%",
        },
        y: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3
      })
    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 overflow-hidden bg-slate-50/30 dark:bg-black/30">

      <div className="container relative z-10 px-4 mx-auto">
        <div className="cta-box max-w-5xl mx-auto rounded-[3rem] p-12 md:p-24 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative overflow-hidden group">
          {/* Animated light rays */}
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-gradient-to-l from-white/10 to-transparent rotate-12 pointer-events-none transition-transform duration-1000 group-hover:translate-x-[-10%]"></div>
          
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="cta-elements p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-8 inline-block">
                <Sparkles className="w-8 h-8 text-blue-200" />
            </div>

            <h2 className="cta-elements text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Ready to take control of <br className="hidden md:block" />
              <span className="text-blue-200">your visa journey?</span>
            </h2>
            
            <p className="cta-elements text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium opacity-90">
              Join thousands of successful applicants who used EloraVisa to navigate their journey with total transparency.
            </p>
            
            <div className="cta-elements flex flex-col sm:flex-row gap-6">
                <SignupSheet 
                    desscription={"Create Free Account"} 
                    className="h-16 px-10 text-lg bg-white text-blue-600 rounded-2xl shadow-xl hover:scale-105 transition-all font-bold flex items-center gap-2 group/btn"
                />
                <button className="h-16 px-10 text-lg bg-transparent border-2 border-white/30 hover:border-white/60 text-white rounded-2xl backdrop-blur-md transition-all font-semibold flex items-center justify-center gap-2">
                    Learn More <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <div className="cta-elements mt-12 flex items-center gap-4 text-blue-200/80 text-sm">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                    ))}
                </div>
                <span>Joined by 500+ applicants this week</span>
            </div>
          </div>

          {/* Glowing blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full filter blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </section>
  )
}
