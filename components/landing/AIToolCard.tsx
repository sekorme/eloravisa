"use client"

import Link from "next/link"
import { useRef, type PointerEvent, type ReactNode } from "react"
import { useInView } from "motion/react"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { useLandingMotion } from "./MotionPreferences"
import styles from "./ToolShowcase.module.css"

export function AIToolCard({ id, icon: Icon, title, eyebrow, description, cta, href, demo, className, dark = false }: {
  id: string; icon: LucideIcon; title: string; eyebrow?: string; description: string; cta: string; href: string; demo?: ReactNode; className?: string; dark?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.15 })
  const { enabled } = useLandingMotion()

  function illuminate(event: PointerEvent<HTMLElement>) {
    if (!enabled || event.pointerType !== "mouse") return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`)
    card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`)
  }

  return (
    <article ref={ref} onPointerMove={illuminate} className={cn(styles.card, dark && styles.darkCard, className)} data-visible={inView && enabled} aria-labelledby={`${id}-title`}>
      <div className={styles.cardLight} aria-hidden="true" />
      <div className="relative">
        <div className={styles.cardEyebrow}><Icon className="h-4 w-4" aria-hidden="true" />{eyebrow ?? title}</div>
        <h3 id={`${id}-title`} className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      {demo && <div className={styles.demo}><span className={styles.sampleLabel}>Product preview · sample content</span>{demo}</div>}
      <Link href={href} onClick={() => trackEvent("tool_card_interaction", { location: "ai_tools", label: id })} className={styles.cardLink}>{cta}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
    </article>
  )
}
