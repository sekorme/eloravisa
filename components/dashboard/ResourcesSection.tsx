"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Headset, Mic, PenLine, Upload, Wallet, type LucideIcon } from "lucide-react"
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal"
import { TOKEN_COSTS } from "@/lib/billing/plans"
import { cn } from "@/lib/utils"
import { dashCard, dashCardTitle } from "./dashboardStyles"

/**
 * Quick actions: each tile has its own soft colour from one family (green,
 * sky, amber, violet, teal, rose) so they're easy to tell apart, a one-line
 * description and the token cost where there is one.
 */
type Tone = "green" | "sky" | "amber" | "violet" | "teal" | "rose"

const TONES: Record<Tone, { tile: string; blob: string; meta: string }> = {
  green: {
    tile: "from-emerald-50 to-lp-card border-emerald-100 hover:border-emerald-300 dark:from-emerald-400/10 dark:border-emerald-400/20",
    blob: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    meta: "text-emerald-700 dark:text-emerald-300",
  },
  sky: {
    tile: "from-sky-50 to-lp-card border-sky-100 hover:border-sky-300 dark:from-sky-400/10 dark:border-sky-400/20",
    blob: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    meta: "text-sky-700 dark:text-sky-300",
  },
  amber: {
    tile: "from-amber-50 to-lp-card border-amber-100 hover:border-amber-300 dark:from-amber-400/10 dark:border-amber-400/20",
    blob: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    meta: "text-amber-700 dark:text-amber-300",
  },
  violet: {
    tile: "from-violet-50 to-lp-card border-violet-100 hover:border-violet-300 dark:from-violet-400/10 dark:border-violet-400/20",
    blob: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    meta: "text-violet-700 dark:text-violet-300",
  },
  teal: {
    tile: "from-teal-50 to-lp-card border-teal-100 hover:border-teal-300 dark:from-teal-400/10 dark:border-teal-400/20",
    blob: "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
    meta: "text-teal-700 dark:text-teal-300",
  },
  rose: {
    tile: "from-rose-50 to-lp-card border-rose-100 hover:border-rose-300 dark:from-rose-400/10 dark:border-rose-400/20",
    blob: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    meta: "text-rose-700 dark:text-rose-300",
  },
}

const tileBase =
  "group relative flex min-h-[148px] w-full flex-col overflow-hidden rounded-[1.25rem] border bg-gradient-to-br p-4 text-left transition-[transform,border-color,box-shadow] duration-300 motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_rgba(8,32,26,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure md:p-5"

function TileBody({ icon: Icon, title, description, meta, tone }: { icon: LucideIcon; title: string; description: string; meta?: string; tone: Tone }) {
  const t = TONES[tone]
  return (
    <>
      {/* Faint dot pattern in the corner, echoing the welcome banner. */}
      <span className="lp-grid-dots pointer-events-none absolute -right-4 -top-4 h-24 w-24 opacity-40 [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]" aria-hidden="true" />
      <span className={cn("relative flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105", t.blob)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="relative mt-auto pt-4">
        <span className="block font-display text-base font-semibold tracking-[-0.02em] text-lp-fg">{title}</span>
        <span className="block text-xs text-lp-muted">{description}</span>
      </span>
      <span className="relative mt-2 flex items-center justify-between">
        <span className={cn("text-xs font-semibold", t.meta)}>{meta}</span>
        <ArrowRight className="h-4 w-4 text-lp-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-lp-fg" aria-hidden="true" />
      </span>
    </>
  )
}

type LinkAction = { kind: "link"; href: string; external?: boolean }
type Action = {
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
  meta?: string
  to: LinkAction | { kind: "upload" }
}

const ACTIONS: Action[] = [
  { title: "Upload a document", description: "Add it to your checklist", icon: Upload, tone: "green", meta: "Free", to: { kind: "upload" } },
  { title: "Practise your interview", description: "Live AI visa officer", icon: Mic, tone: "sky", meta: `${TOKEN_COSTS.MOCK_INTERVIEW} tokens`, to: { kind: "link", href: "/dashboard/ai-mock-interview" } },
  { title: "Check your funds", description: "Will your statement pass?", icon: Wallet, tone: "amber", meta: `${TOKEN_COSTS.FINANCIAL_ANALYSIS} tokens`, to: { kind: "link", href: "/dashboard/finances" } },
  { title: "Draft a letter", description: "Cover letter, itinerary, sponsor", icon: PenLine, tone: "violet", meta: `${TOKEN_COSTS.DOCUMENT_DRAFT} tokens`, to: { kind: "link", href: "/dashboard/draft" } },
  { title: "Visa guides", description: "Requirements by country", icon: BookOpen, tone: "teal", meta: "Free", to: { kind: "link", href: "/visa-requirements" } },
  { title: "Get support", description: "Email our team", icon: Headset, tone: "rose", meta: "info@eloravisa.com", to: { kind: "link", href: "mailto:info@eloravisa.com?subject=Help%20with%20my%20visa%20application", external: true } },
]

export function ResourcesSection() {
  return (
    <div id="quick-actions" className={cn("p-5 md:p-6", dashCard)}>
      <div className="mb-4">
        <h2 className={dashCardTitle}>Quick actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {ACTIONS.map((a) => {
          const body = <TileBody icon={a.icon} title={a.title} description={a.description} meta={a.meta} tone={a.tone} />
          const className = cn(tileBase, TONES[a.tone].tile)
          if (a.to.kind === "upload") {
            return (
              <UploadDocumentsModal key={a.title}>
                <button type="button" className={className}>{body}</button>
              </UploadDocumentsModal>
            )
          }
          return a.to.external ? (
            <a key={a.title} href={a.to.href} className={className}>{body}</a>
          ) : (
            <Link key={a.title} href={a.to.href} className={className}>{body}</Link>
          )
        })}
      </div>
    </div>
  )
}
