import { ShieldCheck, Sparkles, CircleDollarSign, UserCog } from "lucide-react"
import type { PublicStats } from "@/lib/publicStats"
import { TrustMetricsCounters } from "./TrustMetricsCounters"
import { Reveal, RevealGroup, RevealItem } from "./ui"

const BADGES = [
  { icon: ShieldCheck, label: "Secure data" },
  { icon: Sparkles, label: "AI powered" },
  { icon: CircleDollarSign, label: "Transparent pricing" },
  { icon: UserCog, label: "Self-guided platform" },
]

export function TrustMetrics({ stats }: { stats: PublicStats }) {
  const metrics = [
    stats.registeredApplicants !== undefined
      ? { value: stats.registeredApplicants, label: "Registered applicants" }
      : null,
    stats.documentReviews !== undefined
      ? { value: stats.documentReviews, label: "AI document reviews" }
      : null,
    stats.mockInterviews !== undefined
      ? { value: stats.mockInterviews, label: "Mock interviews completed" }
      : null,
  ].filter((m): m is { value: number; label: string } => m !== null)

  return (
    <section id="trust-metrics" className="relative scroll-mt-24 bg-lp-page py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <Reveal>
          <p className="mx-auto mb-10 max-w-xl text-center font-display text-[11px] font-medium uppercase tracking-[0.2em] text-lp-muted">
            Visa preparation made clearer for applicants around the world
          </p>
        </Reveal>

        {metrics.length > 0 && <TrustMetricsCounters metrics={metrics} />}

        <RevealGroup className="mt-10 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
          {BADGES.map((badge) => (
            <RevealItem key={badge.label}>
              <div className="flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-2 shadow-sm">
                <badge.icon className="h-3.5 w-3.5 shrink-0 text-lp-azure" aria-hidden="true" />
                <span className="text-xs font-semibold text-lp-fg/80">{badge.label}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
