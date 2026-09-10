"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { MotionConfig, useReducedMotion } from "motion/react"
import { Pause, Play } from "lucide-react"

const MotionContext = createContext({ paused: false, reduced: false, enabled: false })
export const useLandingMotion = () => useContext(MotionContext)

export function MotionPreferences({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? true
  const [paused, setPaused] = useState(false)
  return (
    <MotionContext.Provider value={{ paused, reduced, enabled: !paused && !reduced }}>
      <MotionConfig reducedMotion="user">
        <div data-motion={paused || reduced ? "paused" : "active"}>
          {children}
          <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} className="motion-control fixed bottom-4 left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-lp-line bg-lp-card/95 px-4 text-xs font-medium text-lp-fg shadow-lg backdrop-blur" disabled={reduced}>
            {paused || reduced ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            {reduced ? "Reduced motion" : paused ? "Resume motion" : "Pause motion"}
          </button>
        </div>
      </MotionConfig>
    </MotionContext.Provider>
  )
}
