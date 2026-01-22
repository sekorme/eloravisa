"use client"

import React from "react"
import { ShieldCheck, Info } from "lucide-react"

export function TrustSection() {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/20 border-y">
      <div className="container px-4 mx-auto max-w-4xl text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-6 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>Improve Visa chances</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            <span>Educational guidance only</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <span>You submit your own application</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
          Disclaimer: We are not a law firm and do not provide legal advice. We provide self-help services at your specific direction. 
          We are not affiliated with any government agency.
        </p>
      </div>
    </section>
  )
}
