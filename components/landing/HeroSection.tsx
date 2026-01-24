"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import {SignupSheet} from "@/components/auth/SignupSheet";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate blobs
      gsap.to(".blob", {
        x: () => `+=${gsap.utils.random(-150, 150)}`,
        y: () => `+=${gsap.utils.random(-150, 150)}`,
        scale: () => gsap.utils.random(0.9, 1.3),
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: () => gsap.utils.random(0, 1),
      });

      // Animate content
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.6 })
        .from(".hero-title", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.3")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(".hero-trust", { opacity: 0, duration: 0.8 }, "-=0.2")

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-background overflow-hidden">
      {/* Animated Blob Background */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="blob absolute top-0 left-0 w-96 h-96 bg-blue-400/50 rounded-full filter blur-lg"></div>
        <div className="blob absolute top-0 right-0 w-80 h-80 bg-purple-400/50 rounded-full filter blur-lg"></div>
        <div className="blob absolute bottom-0 left-1/4 w-72 h-72 bg-green-400/50 rounded-full filter blur-lg"></div>
      </div>

      <div className="container px-4 md:px-6 mx-auto text-center max-w-5xl">
        <div className="flex justify-center mb-6 hero-badge">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <ShieldCheck className="w-3 h-3 mr-1" />
            No Agents. No Hidden Fees.
          </div>
        </div>

        <h1 className="hero-title text-4xl md:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 text-transparent bg-clip-text">
            Apply for Your Visa Yourself
          </span>
          <br className="hidden md:block" />
          <span className="text-blue-600 dark:text-blue-400">With Expert Guidance, Not Agents</span>
        </h1>

        <p className="hero-desc text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Learn how to apply for visas the right way using step‑by‑step guidance, AI document checks, and realistic mock interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 hero-cta">
                <SignupSheet desscription={"Sign Up Now, It's Self Guided"} className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"/>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full" asChild>
            <Link href="#how-it-works">
              See How It Works
            </Link>
          </Button>
        </div>

        <p className="hero-trust text-sm text-muted-foreground font-medium">
          Trusted by applicants across Ghana, Nigeria & Africa
        </p>
      </div>
    </section>
  )
}
