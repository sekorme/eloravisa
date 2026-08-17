"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ArrowDown, ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react"
import { SignupSheet } from "@/components/auth/SignupSheet"
import { prefersReducedMotion } from "@/lib/motion"

const HERO_BENEFITS = [
  "Personalised visa checklist",
  "AI document review",
  "Realistic interview practice",
]

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".hero-kicker", { y: 16, opacity: 0, duration: 0.6 })
        .from(
          ".hero-line-inner",
          { yPercent: 110, duration: 0.9, stagger: 0.12, ease: "power4.out" },
          "-=0.25"
        )
        .from(".hero-copy", { y: 20, opacity: 0, duration: 0.65 }, "-=0.45")
        .from(".hero-action", { y: 18, opacity: 0, duration: 0.55, stagger: 0.1 }, "-=0.35")
        .from(".hero-benefit", { y: 12, opacity: 0, duration: 0.45, stagger: 0.07 }, "-=0.25")
        .from(".hero-proof", { opacity: 0, y: 14, duration: 0.6 }, "-=0.2")
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative isolate flex min-h-screen items-end overflow-hidden bg-slate-950 text-white"
      aria-labelledby="hero-heading"
    >
      <video
        className="absolute inset-0 -z-30 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/herovideo.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 -z-20 bg-slate-950/55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/15" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/45" />

      <div className="container mx-auto flex min-h-screen w-full flex-col justify-end px-4 pb-8 pt-28 md:px-6 md:pb-10 lg:pb-12">
        <div className="max-w-4xl pb-10 md:pb-14 lg:pb-16">
          <div className="hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-landing-cyan" aria-hidden="true" />
            Your visa journey, made clearer
          </div>

          <h1
            id="hero-heading"
            className="max-w-4xl text-5xl font-semibold leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            <span className="hero-line block overflow-hidden pb-1">
              <span className="hero-line-inner block">Prepare smarter.</span>
            </span>
            <span className="hero-line block overflow-hidden pb-2">
              <span className="hero-line-inner block text-white/65">Travel with confidence.</span>
            </span>
          </h1>

          <p className="hero-copy mt-6 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">
            Elora Visa gives you the tools, guidance, and practice to prepare your application yourself, from your first checklist to your final interview.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="hero-action">
              <SignupSheet
                desscription="Start your free application"
                className="h-14 w-full rounded-full bg-white px-7 text-base font-semibold text-slate-950 shadow-2xl transition-transform hover:scale-[1.02] hover:bg-white/90 sm:w-auto"
              />
            </div>
            <a
              href="#how-it-works"
              className="hero-action inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              See how it works
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <ul className="mt-7 flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {HERO_BENEFITS.map((benefit) => (
              <li key={benefit} className="hero-benefit flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-landing-cyan/20 text-landing-cyan">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-proof flex items-center justify-between gap-4 border-t border-white/20 pt-5 text-xs text-white/60 md:text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-landing-cyan" aria-hidden="true" />
            <span>Private, secure, and always in your control</span>
          </div>
          <a
            href="#how-it-works"
            aria-label="Scroll to learn how Elora Visa works"
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 font-medium uppercase tracking-widest text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex"
          >
            Explore
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
