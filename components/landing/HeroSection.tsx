"use client"

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Send } from "lucide-react"
import Link from "next/link"
import { SignupSheet } from "@/components/auth/SignupSheet";
import { HeroBackground } from "./HeroBackground";
import { cn } from "@/lib/utils";

const IMAGES = ["/IMG_9093.jpg", "/30.JPG", "/elora5.jpeg", "/akyere.jpg"];

const emptySubscribe = () => () => {};

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  useEffect(() => {
    if (!mounted) return
    
    // GSAP Animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      
      tl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.8 })
        .from(".hero-title", { y: 30, opacity: 0, duration: 1, ease: "power4.out" }, "-=0.4")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.8 }, "-=0.7")
        .from(".hero-cta", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.6")
        .from(".hero-trust", { opacity: 0, duration: 1 }, "-=0.4")
      
      // Animate images with a floating effect
      gsap.from(".hero-image-item", {
        opacity: 0,
        scale: 0.9,
        y: 40,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out"
      }, "-=1.2")

      // Continuous floating animation
      gsap.to(".hero-image-item", {
        y: "random(-15, 15)",
        x: "random(-10, 10)",
        rotation: "random(-2, 2)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1 // Add a delay to wait for the entry animation to finish
      })

    }, containerRef)

    return () => {
      ctx.revert();
    }
  }, [mounted])

  return (
    <section ref={containerRef} className="relative pt-16 pb-14 md:pt-16 md:pb-24 bg-transparent overflow-hidden min-h-[90vh] flex items-center isolation-auto">
      
      <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="text-left max-w-2xl mx-auto lg:mx-0">
            <div className="mb-8 hero-badge">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Trusted by 12,000+ Applicants Worldwide
              </div>
            </div>

            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05]">
              <span className="block bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 text-transparent bg-clip-text">
                Your Global Journey
              </span>
              <span className="block text-blue-600 dark:text-blue-500">
                Starts Right Here.
              </span>
            </h1>

            <p className="hero-desc text-lg md:text-xl text-muted-foreground/90 mb-10 max-w-xl leading-relaxed">
              Skip the expensive agents and take control of your visa application with our AI-powered platform and expert-led guidance system.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-start gap-5 mb-12 hero-cta relative z-20">
              <SignupSheet desscription={"Start Your Application Today"} className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all duration-300 w-full sm:w-auto font-bold"/>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-800 w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 group" asChild>
                <Link href="https://t.me/+wWazCHK2wEMzMzdk" target={"_blank"}>
                  <Send className="w-5 h-5 mr-2 text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Join Our Community
                </Link>
              </Button>
            </div>

            <div className="hero-trust flex items-center gap-6 p-4 rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-white/20 dark:border-white/5 w-fit">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-11 h-11 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-800 shadow-sm overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
               <div className="flex flex-col">
                 <p className="text-sm text-foreground font-bold">100% Success Rate</p>
                 <p className="text-xs text-muted-foreground font-medium">From our last 500 graduates</p>
               </div>
            </div>
          </div>

          {/* Right Column: Dynamic Image Grid */}
          <div className="hero-images relative lg:block">
            {mounted && (
              <div className="relative grid grid-cols-2 gap-6 px-4">
                {IMAGES.map((src, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "hero-image-item relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white/50 dark:border-slate-800/50",
                      i === 0 && "md:translate-y-12",
                      i === 1 && "md:-translate-y-4",
                      i === 2 && "md:translate-y-8",
                      i === 3 && "md:-translate-y-12"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity z-10" />
                    <img 
                      src={src} 
                      alt={`Applicant ${i}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mb-2 shadow-lg">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">Visa Approved</p>
                    </div>
                  </div>
                ))}
                
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 rounded-full blur-[120px] -z-10" />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
