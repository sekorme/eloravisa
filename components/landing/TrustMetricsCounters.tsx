"use client"

import { NumberTicker } from "@/components/ui/number-ticker"
import { RevealGroup, RevealItem } from "./ui"

export function TrustMetricsCounters({
  metrics,
}: {
  metrics: { value: number; label: string }[]
}) {
  return (
    <RevealGroup className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric, i) => (
        <RevealItem key={metric.label}>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-lp-line bg-lp-card p-6 text-center lp-shadow">
            <span
              aria-hidden="true"
              className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-lp-azure/10 blur-2xl"
            />
            <div className="font-display text-4xl font-medium text-lp-fg md:text-5xl">
              <NumberTicker value={metric.value} delay={i * 0.1} className="font-display text-4xl font-medium text-lp-fg md:text-5xl" />
              <span className="text-lp-azure">+</span>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-lp-muted">{metric.label}</p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
