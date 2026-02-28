"use client"

import React, { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { ShieldCheck, Info, Lock } from "lucide-react"

export function TrustSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  return (
    <section ref={containerRef} className="relative py-16 bg-white dark:bg-[#020205] border-y border-slate-200 dark:border-slate-800 overflow-hidden">

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Improve Success Rate</h3>
                    <p className="text-sm text-muted-foreground">Expertly crafted strategies based on successful application patterns.</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Info className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Educational Guidance</h3>
                    <p className="text-sm text-muted-foreground">We empower you with knowledge. You remain the owner of your application.</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">Your sensitive data is encrypted and never shared with unauthorized parties.</p>
                </div>
            </div>
            
            <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-8">
                <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-70">
                    <span className="font-semibold block mb-2 uppercase tracking-widest">Legal Disclaimer</span>
                    EloraVisa is not a law firm and does not provide legal advice. We are not affiliated with any government agency or embassy. Our services provide self-help guidance and AI-powered document reviews at your specific direction.
                </p>
            </div>
        </div>
      </div>
    </section>
  )
}
