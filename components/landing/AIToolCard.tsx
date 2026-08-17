"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { ArrowRight, type LucideIcon } from "lucide-react"
import { useTilt } from "@/hooks/useTilt"
import { cn } from "@/lib/utils"

export function AIToolCard({
  icon: Icon,
  title,
  description,
  cta,
  href,
  demo,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  cta: string
  href: string
  demo?: ReactNode
  className?: string
}) {
  const tiltRef = useTilt<HTMLDivElement>({ max: 5, scale: 1.015 })

  return (
    <div
      ref={tiltRef}
      className={cn(
        "group relative flex flex-col rounded-[1.75rem] p-6 md:p-7 overflow-hidden",
        "bg-white/50 dark:bg-white/[0.04] backdrop-blur-xl border border-slate-200/60 dark:border-white/10",
        "hover:shadow-2xl hover:shadow-landing-blue/10 transition-shadow duration-500",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-landing-cyan/20 via-landing-blue/20 to-landing-violet/20 text-landing-blue dark:text-landing-cyan shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{description}</p>

      {demo && <div className="mb-5 flex-1">{demo}</div>}

      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-landing-blue dark:text-landing-cyan group-hover:gap-2.5 transition-all"
      >
        {cta}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )
}
