"use client"

import dynamic from "next/dynamic"
import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import { useInView } from "motion/react"
import { HeroGlobeFallback } from "./HeroGlobeFallback"
import { useLandingMotion } from "./MotionPreferences"

const Scene = dynamic(() => import("./VisaGlobeCanvas").then((m) => m.VisaGlobeCanvas), {
  ssr: false,
  loading: () => <HeroGlobeFallback />,
})

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <HeroGlobeFallback /> : this.props.children }
}

export function VisaJourneyScene() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: "100px" })
  const { enabled } = useLandingMotion()
  const [capable, setCapable] = useState(false)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const screen = window.matchMedia("(min-width: 1024px) and (pointer: fine)")
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    const detect = () => setCapable(screen.matches && !nav.connection?.saveData && (nav.deviceMemory ?? 8) >= 4 && (nav.hardwareConcurrency || 4) >= 4)
    detect()
    screen.addEventListener("change", detect)
    const visibility = () => setVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", visibility)
    return () => { screen.removeEventListener("change", detect); document.removeEventListener("visibilitychange", visibility) }
  }, [])
  return <div ref={ref} className="h-full w-full" aria-hidden="true"><SceneBoundary>{capable && enabled ? <Scene active={inView && visible} /> : <HeroGlobeFallback />}</SceneBoundary></div>
}
