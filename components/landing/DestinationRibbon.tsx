"use client"

import { useEffect, useRef, useState } from "react"
import { Globe2, Pause, Play } from "lucide-react"
import { DESTINATIONS, DESTINATION_CAPTION, type Destination } from "@/lib/landing/content"
import { useLandingMotion } from "./MotionPreferences"
import styles from "./JourneySections.module.css"

function DestinationItem({ destination }: { destination: Destination }) {
  const flag = destination.code.toUpperCase().replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
  return (
    <li className="flex shrink-0 items-center gap-3 px-5 md:px-7">
      <span aria-hidden="true" className="text-xl saturate-[0.75]">{flag}</span>
      <span className="whitespace-nowrap font-display text-sm font-semibold text-lp-fg/85 md:text-base">{destination.name}</span>
      <span aria-hidden="true" className="ml-5 h-1 w-1 rounded-full bg-lp-azure/35" />
    </li>
  )
}

export function DestinationRibbon() {
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const { enabled } = useLandingMotion()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "80px" })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="destinations"
      aria-labelledby="destinations-heading"
      data-running={inView && !paused && enabled}
      className={`${styles.ribbon} relative scroll-mt-24 border-b border-lp-line bg-lp-card py-7 md:py-9`}
    >
      <h2 id="destinations-heading" className="sr-only">Popular destinations</h2>
      <div className={styles.ribbonViewport}>
        <div className={styles.ribbonTrack}>
          <ul className={styles.destinationList}>
            {DESTINATIONS.map((destination) => <DestinationItem key={destination.code} destination={destination} />)}
          </ul>
          <ul className={`${styles.destinationList} ${styles.ribbonDuplicate}`} aria-hidden="true">
            {DESTINATIONS.map((destination) => <DestinationItem key={destination.code} destination={destination} />)}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-5 flex max-w-7xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-5">
        <p className="flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-lp-muted sm:text-sm">
          <Globe2 className="mt-0.5 hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
          {DESTINATION_CAPTION}
        </p>
        <button
          type="button"
          aria-pressed={paused}
          aria-label={paused ? "Resume destination animation" : "Pause destination animation"}
          onClick={() => setPaused((value) => !value)}
          className={`${styles.ribbonControl} inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-medium text-lp-muted transition-colors hover:bg-lp-card-2 hover:text-lp-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-azure`}
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
    </section>
  )
}
