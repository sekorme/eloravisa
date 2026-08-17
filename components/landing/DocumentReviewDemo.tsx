"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { prefersReducedMotion } from "@/lib/motion"

const SUGGESTIONS = [
  { label: "Financial statement date", ok: false },
  { label: "Proof of accommodation", ok: true },
  { label: "Purpose of travel letter", ok: true },
]

export function DocumentReviewDemo() {
  const [status, setStatus] = useState<"reviewing" | "ready">("reviewing")

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStatus("ready")
      return
    }
    const interval = setInterval(() => {
      setStatus((s) => (s === "reviewing" ? "ready" : "reviewing"))
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const reduced = prefersReducedMotion()

  return (
    <div className="relative rounded-2xl bg-slate-950/90 border border-white/10 p-4 overflow-hidden h-full min-h-[180px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
          <FileText className="w-3.5 h-3.5" />
          Financial_Statement.pdf
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
            status === "reviewing"
              ? "bg-landing-blue/20 text-landing-cyan"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {status === "reviewing" ? "Reviewing…" : "Suggestions ready"}
        </span>
      </div>

      <div className="relative rounded-lg bg-white/5 h-16 mb-3 overflow-hidden">
        {status === "reviewing" && !reduced && (
          <motion.div
            className="absolute inset-x-0 h-8 bg-gradient-to-b from-landing-cyan/0 via-landing-cyan/30 to-landing-cyan/0"
            animate={{ y: ["-10%", "110%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
        )}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="absolute left-3 right-3 h-1.5 rounded bg-white/10" style={{ top: `${8 + i * 14}px` }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {status === "ready" && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            {SUGGESTIONS.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-[11px] text-white/70">
                {s.ok ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                )}
                {s.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
