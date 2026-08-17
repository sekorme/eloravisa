"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { FileText, Mic, ListChecks, PenSquare, MessageCircleQuestion, FolderLock, Sparkles, ShieldCheck, Globe } from "lucide-react"
import { AIToolCard } from "./AIToolCard"
import { DocumentReviewDemo } from "./DocumentReviewDemo"
import { MockInterviewDemo } from "./MockInterviewDemo"
import { ChecklistDemo } from "./ChecklistDemo"

gsap.registerPlugin(ScrollTrigger)

export function AIToolsBento() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      gsap.from(".ai-tool-card", {
        scrollTrigger: { trigger: containerRef.current, start: "top bottom", toggleActions: "play none none none" },
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "all",
      })
    }, containerRef)
    return () => ctx.revert()
  }, [mounted])

  return (
    <section id="ai-tools" ref={containerRef} className="relative py-24 md:py-32 overflow-hidden bg-[#f8fafc] dark:bg-[#050510]">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-landing-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-landing-violet/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative px-4 mx-auto z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-landing-blue/5 border border-landing-blue/10 text-landing-blue dark:text-landing-cyan text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Cutting-edge technology
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Powerful{" "}
            </span>
            <span className="bg-gradient-to-r from-landing-cyan via-landing-blue to-landing-violet bg-clip-text text-transparent">
              AI tools for better preparation
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Prepare your documents, practise your interview and understand your next steps from one secure platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div className="ai-tool-card">
            <AIToolCard
              icon={FileText}
              title="AI Document Review"
              description="Review your documents for missing information, inconsistencies and areas that may require clearer explanations before submission."
              cta="Review a Document"
              href="/dashboard"
              demo={<DocumentReviewDemo />}
            />
          </div>

          <div className="ai-tool-card">
            <AIToolCard
              icon={Mic}
              title="AI Visa Mock Interview"
              description="Practise realistic visa interview questions and receive structured feedback on clarity, completeness and confidence."
              cta="Start a Mock Interview"
              href="/dashboard"
              demo={<MockInterviewDemo />}
            />
          </div>

          <div className="ai-tool-card">
            <AIToolCard
              icon={ListChecks}
              title="Personalized Visa Checklist"
              description="Turn visa requirements into a clear and manageable preparation plan."
              cta="Create My Checklist"
              href="/dashboard"
              demo={<ChecklistDemo />}
            />
          </div>

          <div className="ai-tool-card">
            <AIToolCard
              icon={PenSquare}
              title="AI SOP and Statement Assistance"
              description="Create a structured starting point for your statement or SOP, then edit it to reflect your real circumstances and voice."
              cta="Prepare My Statement"
              href="/dashboard"
            />
          </div>

          <div className="ai-tool-card">
            <AIToolCard
              icon={MessageCircleQuestion}
              title="AI Visa Guidance"
              description="Ask questions and receive educational guidance based on your selected destination and visa objective."
              cta="Ask Elora AI"
              href="/dashboard"
            />
          </div>

          <div className="ai-tool-card">
            <AIToolCard
              icon={FolderLock}
              title="Secure Document Storage"
              description="Keep your preparation documents organized and accessible from your Elora Visa dashboard."
              cta="Organize My Documents"
              href="/dashboard"
            />
          </div>
        </div>

        <div className="mt-20 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold text-sm">Secure data</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span className="font-semibold text-sm">Built for global applicants</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">AI powered</span>
          </div>
        </div>
      </div>
    </section>
  )
}
