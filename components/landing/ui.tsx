"use client"

import { useEffect, type ComponentPropsWithoutRef, type ReactNode } from "react"
import Link from "next/link"
import { useAnimate, useInView, stagger } from "motion/react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLandingMotion } from "./MotionPreferences"

/* -------------------------------------------------------------------------- */
/*  Scroll reveal                                                              */
/* -------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const

type RevealProps = {
  children: ReactNode
  className?: string
  /** Seconds to wait before the reveal starts. */
  delay?: number
  /** Pixels to travel upward while fading in. */
  y?: number
  /** Start slightly scaled down for card-like elements. */
  scale?: boolean
  as?: "div" | "section" | "article" | "li" | "span" | "p" | "h2" | "h3"
  once?: boolean
  amount?: number
}

/**
 * Fades + slides an element into view the first time it scrolls into the
 * viewport. Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  scale = false,
  as = "div",
  once = true,
  amount = 0.25,
}: RevealProps) {
  const [scope, animate] = useAnimate()
  const visible = useInView(scope, { once, amount })
  const { enabled } = useLandingMotion()
  useEffect(() => {
    if (!visible || !enabled || !scope.current) return
    const controls = animate(scope.current, { opacity: [.65, 1], y: [y, 0], scale: [scale ? .98 : 1, 1] }, { duration: .6, delay, ease: EASE })
    return () => controls.stop()
  }, [visible, enabled, animate, scope, y, scale, delay])
  const Tag = as
  return <Tag ref={scope} className={className}>{children}</Tag>
}

export function RevealGroup({ children, className, amount = .15 }: { children: ReactNode; className?: string; amount?: number }) {
  const [scope, animate] = useAnimate()
  const visible = useInView(scope, { once: true, amount })
  const { enabled } = useLandingMotion()
  useEffect(() => {
    if (!visible || !enabled || !scope.current?.querySelector("[data-reveal-item]")) return
    const controls = animate("[data-reveal-item]", { opacity: [.65, 1], y: [16, 0] }, { duration: .55, delay: stagger(.08), ease: EASE })
    return () => controls.stop()
  }, [visible, enabled, animate, scope])
  return <div ref={scope} className={className}>{children}</div>
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return <div data-reveal-item className={className}>{children}</div>
}

/* -------------------------------------------------------------------------- */
/*  Typography                                                                 */
/* -------------------------------------------------------------------------- */

export function Eyebrow({ children, className, tone = "light" }: { children: ReactNode; className?: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em]",
        tone === "light"
          ? "border-lp-line bg-lp-card/70 text-lp-fg/80 backdrop-blur"
          : "border-white/15 bg-white/10 text-white/85 backdrop-blur",
        className
      )}
    >
      {children}
    </span>
  )
}

export function Display({
  children,
  className,
  as: Tag = "h2",
  size = "md",
}: {
  children: ReactNode
  className?: string
  as?: "h1" | "h2" | "h3" | "p"
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizes = {
    sm: "text-xl sm:text-2xl md:text-3xl",
    md: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
    lg: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    xl: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
  }
  return (
    <Tag
      className={cn(
        "font-display font-semibold leading-[1.08] tracking-[-0.045em] text-balance",
        sizes[size],
        className
      )}
    >
      {children}
    </Tag>
  )
}

/* -------------------------------------------------------------------------- */
/*  Buttons + links                                                            */
/* -------------------------------------------------------------------------- */

const pillBase =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 focus-visible:ring-offset-lp-page"

const pillVariants = {
  navy: "bg-lp-navy text-white hover:bg-lp-navy-2 hover:shadow-[0_16px_40px_-12px_rgba(12,38,71,0.6)]",
  azure: "bg-lp-azure text-white hover:bg-lp-azure-2 hover:shadow-[0_16px_40px_-12px_rgba(30,108,240,0.7)]",
  white: "bg-white text-lp-navy hover:bg-lp-sky-2 hover:shadow-[0_16px_40px_-12px_rgba(11,35,67,0.35)]",
  outline: "border border-lp-fg/20 bg-transparent text-lp-fg hover:border-lp-fg/50 hover:bg-lp-card/60",
  "outline-white": "border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10",
}

const pillSizes = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-sm md:text-[15px]",
  lg: "h-14 px-8 text-base",
}

type PillLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: keyof typeof pillVariants
  size?: keyof typeof pillSizes
  arrow?: boolean
}

export function PillLink({ className, variant = "navy", size = "md", arrow = true, children, ...props }: PillLinkProps) {
  return (
    <Link className={cn(pillBase, pillVariants[variant], pillSizes[size], className)} {...props}>
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />}
    </Link>
  )
}

/** Class string for the SignupSheet button so it matches PillLink. */
export function pillClass(variant: keyof typeof pillVariants = "navy", size: keyof typeof pillSizes = "md", extra?: string) {
  return cn(pillBase, pillVariants[variant], pillSizes[size], extra)
}

/** Small uppercase text link with an animated underline, e.g. "OUR SERVICES". */
export function TextLink({
  className,
  children,
  tone = "light",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { tone?: "light" | "dark" }) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-2 font-display text-[11px] font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure rounded-sm",
        tone === "light" ? "text-lp-fg/80 hover:text-lp-fg" : "text-white/80 hover:text-white",
        className
      )}
      {...props}
    >
      <span className="relative">
        {children}
        <span
          className={cn(
            "absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-100 transition-transform duration-300 group-hover:scale-x-50",
            tone === "light" ? "bg-lp-fg/50" : "bg-white/60"
          )}
        />
      </span>
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  )
}

/* -------------------------------------------------------------------------- */
/*  Cards                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A rounded card with a small "tab" on its top-left corner, flowing into the
 * card body with concave corners (the Payrot-style notch). The tab is a good
 * place for a badge or icon; the body takes the rest.
 */
export function TabCard({
  tab,
  children,
  className,
  bodyClassName,
  tabClassName,
  tone = "card",
}: {
  tab: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  tabClassName?: string
  tone?: "card" | "navy"
}) {
  const surface = tone === "navy" ? "bg-lp-navy text-white" : "bg-lp-card text-lp-fg"
  const ear = tone === "navy" ? "[--ear:var(--lp-navy)]" : "[--ear:var(--lp-card)]"
  return (
    <div className={cn("relative pt-10", className)}>
      <div
        className={cn(
          "absolute left-0 top-0 flex h-10 items-center rounded-t-[1.25rem] px-4",
          surface,
          tabClassName
        )}
      >
        {tab}
        <span className={cn("lp-ear lp-ear-r", ear)} aria-hidden="true" />
      </div>
      <div className={cn("rounded-[1.5rem] rounded-tl-none", surface, bodyClassName)}>{children}</div>
    </div>
  )
}

/** Avatar stack used in "N+ applicants" style pills. */
export function AvatarStack({ className }: { className?: string }) {
  const faces = ["/ambassador2.jpeg", "/IMG_9093.jpg", "/akyere.jpg"]
  return (
    <span className={cn("flex -space-x-2", className)}>
      {faces.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          className="h-7 w-7 rounded-full border-2 border-lp-card object-cover"
        />
      ))}
    </span>
  )
}
