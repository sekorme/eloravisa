"use client"

import { useEffect, useState } from "react"
import { Briefcase, ExternalLink, GraduationCap, Newspaper } from "lucide-react"
import { auth } from "@/firebase/client"
import { cn } from "@/lib/utils"
import { useDashboardData } from "@/context/DashboardDataContext"
import type { InsightItem } from "@/app/api/insights/route"
import { dashCard, dashCardSubtitle, dashCardTitle } from "./dashboardStyles"
import { EmptyState } from "./delight/EmptyState"

const KIND = {
  immigration: { label: "Immigration update", icon: Newspaper },
  work: { label: "Work opportunity", icon: Briefcase },
  study: { label: "Study & scholarships", icon: GraduationCap },
} as const

const fmtDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

/**
 * News and opportunities for the active applicant's destination and visa
 * type, found by a daily AI web search (eloraadmin). Immigration updates are
 * checked by the team before they appear. Linked to as /dashboard#insights.
 */
export function InsightsCard() {
  const { userData } = useDashboardData()
  const destination: string | undefined = userData?.onboarding?.destination
  const visaType: string | undefined = userData?.onboarding?.visaType
  const trip = destination && visaType ? `${destination}|${visaType}` : null
  // Tagged with the trip they belong to, so a family switch shows loading, not the last trip's news.
  const [loaded, setLoaded] = useState<{ trip: string; items: InsightItem[] } | null>(null)
  const items = loaded && loaded.trip === trip ? loaded.items : null

  useEffect(() => {
    if (!trip) return
    let cancelled = false
    ;(async () => {
      try {
        const user = auth.currentUser
        if (!user) return
        const res = await fetch("/api/insights", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } })
        const body = res.ok ? await res.json() : { items: [] }
        if (!cancelled) setLoaded({ trip, items: body.items ?? [] })
      } catch {
        if (!cancelled) setLoaded({ trip, items: [] })
      }
    })()
    return () => { cancelled = true }
    // Re-fetch when a family switch changes the active trip.
  }, [trip])

  if (!destination || !visaType) return null

  return (
    <section id="insights" className={cn("scroll-mt-24 p-5", dashCard)}>
      <div className="mb-4">
        <h2 className={dashCardTitle}>News for your trip</h2>
        <p className={dashCardSubtitle}>{destination} {visaType} visa · updated daily</p>
      </div>

      {items === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-lp-card-2" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState art="bell" title="Nothing new right now">
          <p className="text-lp-muted">We check for {destination} visa news{visaType === "Work" ? ", jobs" : visaType === "Study" ? ", scholarships" : ""} every day and will post anything relevant here.</p>
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((item) => {
            const kind = KIND[item.kind] ?? KIND.immigration
            const Icon = kind.icon
            return (
              <li key={item.id} className={cn("flex flex-col rounded-2xl border border-lp-line p-4", item.severity === "high" && "border-red-300 bg-red-50/60 dark:border-red-400/40 dark:bg-red-500/5")}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-lp-muted">
                  <Icon className="h-3.5 w-3.5 text-lp-azure" aria-hidden="true" />
                  {kind.label}
                  {item.severity === "high" && <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-400/10 dark:text-red-300">Important</span>}
                </div>
                <p className="text-sm font-semibold text-lp-fg">{item.title}</p>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-lp-muted">{item.summary}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-lp-muted">
                  <span>
                    {item.deadline ? `${item.kind === "immigration" ? "Takes effect" : "Deadline"} ${fmtDay(item.deadline)}` : item.publishedOn ? fmtDay(item.publishedOn) : null}
                  </span>
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-lp-azure hover:underline">
                    {item.sourceName} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-4 text-xs text-lp-muted">
        Found by AI from public sources. Immigration updates are checked by our team, but rules change: always confirm on the official government site before you act. This isn&apos;t legal advice.
      </p>
    </section>
  )
}
