"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { prefersReducedMotion } from "@/lib/motion"

const ITEMS = ["Passport bio page", "Proof of funds", "Travel itinerary", "Invitation letter"]

export function ChecklistDemo() {
  const [checked, setChecked] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setChecked(ITEMS.length)
      return
    }
    const interval = setInterval(() => {
      setChecked((c) => (c >= ITEMS.length ? 0 : c + 1))
    }, 1100)
    return () => clearInterval(interval)
  }, [])

  const progress = Math.round((checked / ITEMS.length) * 100)

  return (
    <div className="relative rounded-2xl bg-slate-950/90 border border-white/10 p-4 h-full min-h-[180px] flex flex-col justify-center gap-3">
      <ul className="space-y-2">
        {ITEMS.map((item, i) => {
          const done = i < checked
          return (
            <li key={item} className="flex items-center gap-2 text-[11px] text-white/70">
              <span
                className={`flex items-center justify-center w-4 h-4 rounded shrink-0 border transition-colors ${
                  done ? "bg-gradient-to-br from-landing-cyan to-landing-magenta border-transparent" : "border-white/20"
                }`}
              >
                {done && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className={done ? "line-through text-white/40" : ""}>{item}</span>
            </li>
          )
        })}
      </ul>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-landing-cyan to-landing-magenta"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
