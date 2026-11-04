"use client"

import Link from "next/link"
import { ArrowRight, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboardData } from "@/context/DashboardDataContext"
import { startingSteps } from "@/lib/onboarding"
import { dashCard, dashCardSubtitle, dashCardTitle } from "./dashboardStyles"

/**
 * First steps picked from the user's onboarding answers (refusal history,
 * funds, concerns). Each drops off once done; the card hides when none are left.
 */
export function StartHereCard() {
  const { userData, loading } = useDashboardData()
  if (loading || !userData) return null
  const steps = startingSteps(userData)
  if (steps.length === 0) return null

  return (
    <div className={cn("p-5", dashCard)}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lp-sky">
          <Compass className="h-4 w-4 text-lp-azure" />
        </div>
        <div>
          <h2 className={dashCardTitle}>Start here</h2>
          <p className={dashCardSubtitle}>Based on your answers</p>
        </div>
      </div>
      <ol className="space-y-1">
        {steps.map((s) => (
          <li key={s.key}>
            <Link href={s.href} className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-lp-card-2">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{s.title}</span>
                <span className="block text-xs text-lp-muted">{s.why}</span>
              </span>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-lp-muted transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
