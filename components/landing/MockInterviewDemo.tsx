"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Mic } from "lucide-react"
import { prefersReducedMotion } from "@/lib/motion"

const STATES = ["Connecting", "Listening", "Thinking", "Speaking"] as const

export function MockInterviewDemo() {
  const [stateIndex, setStateIndex] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const interval = setInterval(() => {
      setStateIndex((i) => (i + 1) % STATES.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  const status = STATES[stateIndex]
  const active = status === "Listening" || status === "Speaking"

  return (
    <div className="relative rounded-2xl bg-slate-950/90 border border-white/10 p-4 h-full min-h-[180px] flex flex-col items-center justify-center gap-4">
      <span className="absolute top-4 left-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-landing-violet/20 text-landing-cyan">
        {status}
      </span>

      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-landing-cyan via-landing-blue to-landing-violet flex items-center justify-center shadow-lg">
        <Mic className="w-6 h-6 text-white" />
      </div>

      <div className="flex items-end gap-1 h-8">
        {[...Array(9)].map((_, i) => (
          <motion.span
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-landing-cyan to-landing-magenta"
            animate={
              active && !prefersReducedMotion()
                ? { height: [6, 20, 8, 24, 10][i % 5] }
                : { height: 6 }
            }
            transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatType: "reverse", delay: i * 0.05 }}
          />
        ))}
      </div>
    </div>
  )
}
