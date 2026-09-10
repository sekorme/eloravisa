"use client"

import Link from "next/link"
import { useRef, type ComponentProps } from "react"
import { trackEvent, type AnalyticsEvent, type EventParams } from "@/lib/analytics"
import { useLandingMotion } from "./MotionPreferences"

type Props = ComponentProps<typeof Link> & { event?: AnalyticsEvent; eventParams?: EventParams; magnetic?: boolean }

export function TrackedLink({ event = "section_cta_click", eventParams, magnetic, children, onClick, ...props }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const { enabled } = useLandingMotion()
  return <Link {...props} ref={ref} onClick={(e) => { trackEvent(event, eventParams); onClick?.(e) }}
    onPointerMove={(e) => {
      if (!magnetic || !enabled || e.pointerType !== "mouse" || !ref.current) return
      const bounds = ref.current.getBoundingClientRect()
      ref.current.style.translate = `${((e.clientX - bounds.left) / bounds.width - 0.5) * 5}px ${((e.clientY - bounds.top) / bounds.height - 0.5) * 5}px`
    }} onPointerLeave={() => { if (ref.current) ref.current.style.translate = "0 0" }}>
    {children}
  </Link>
}
