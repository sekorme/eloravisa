import { ShieldCheck, Sparkles, CircleDollarSign, UserCog } from "lucide-react"
import { getPublicStats } from "@/lib/publicStats"
import { TrustMetricsCounters } from "./TrustMetricsCounters"

const BADGES = [
  { icon: ShieldCheck, label: "Secure data" },
  { icon: Sparkles, label: "AI powered" },
  { icon: CircleDollarSign, label: "Transparent pricing" },
  { icon: UserCog, label: "Self-guided platform" },
]

export async function TrustMetrics() {
  const stats = await getPublicStats()

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
    <section className="relative py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020205]">
      <div className="container px-4 mx-auto">
        <p className="text-center text-sm font-medium text-muted-foreground mb-10 max-w-xl mx-auto">
          Visa preparation made clearer for applicants around the world.
        </p>

        {metrics.length > 0 && (
          <TrustMetricsCounters metrics={metrics} />
        )}

        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mt-10">
          {BADGES.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-border"
            >
              <badge.icon className="w-3.5 h-3.5 text-landing-blue dark:text-landing-cyan shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
