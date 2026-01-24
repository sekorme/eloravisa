"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import {AnimatedGridPattern} from "@/components/ui/animated-grid-pattern";
import {cn} from "@/lib/utils";
import {SignupSheet} from "@/components/auth/SignupSheet";

gsap.registerPlugin(ScrollTrigger)

export function FinalCTASection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-content", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      })

      // Animate decorative circles
      gsap.to(".cta-circle", {
        scale: () => gsap.utils.random(0.8, 1.2),
        rotate: 360,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative py-20 md:py-32">
      <div className="container px-4 mx-auto text-center max-w-3xl">
        <div className="cta-content bg-blue-600 dark:bg-blue-700 rounded-3xl p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="cta-circle absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full filter blur-xl opacity-50"></div>
          <div className="cta-circle absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full filter blur-xl opacity-50"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Start Your Visa Journey the Right Way</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto relative z-10">
            No agents. No pressure. Learn before you apply.
          </p>
          
          <div className="relative z-10">
              <SignupSheet desscription={"Create Free Account"} className="h-12 px-8 text-base bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all"/>
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
                "inset-x-0 inset-y-[-30%] h-[100%] skew-y-6"
            )}
        />
    </section>
  )
}
