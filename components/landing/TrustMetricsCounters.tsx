"use client"

import { NumberTicker } from "@/components/ui/number-ticker"

export function TrustMetricsCounters({
  metrics,
}: {
  metrics: { value: number; label: string }[]
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <div className="text-3xl md:text-4xl font-extrabold">
            <NumberTicker
              value={metric.value}
              className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-landing-cyan to-landing-magenta bg-clip-text text-transparent"
            />
            <span className="bg-gradient-to-r from-landing-cyan to-landing-magenta bg-clip-text text-transparent">+</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 font-medium">{metric.label}</p>
        </div>
      ))}
    </div>
  )
}
