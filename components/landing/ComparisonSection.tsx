import { Check, X, Sparkles, ShieldCheck, Zap, Users, Globe, BookOpen, type LucideIcon } from "lucide-react"
import { Display, Eyebrow, PillLink, Reveal, RevealGroup, RevealItem } from "./ui"

type Row = { feature: string; agent: string; elora: string; icon: LucideIcon }

const ROWS: Row[] = [
  { feature: "Cost", agent: "High processing fees, often $500+", elora: "Zero processing fees. Pay only for what you need.", icon: Zap },
  { feature: "Interview prep", agent: "Generic tips or no preparation at all", elora: "Unlimited AI mock interviews with structured feedback.", icon: Sparkles },
  { feature: "Ownership", agent: "They apply for you, a complete black box", elora: "You learn the 'how' and stay in full control.", icon: Users },
  { feature: "Transparency", agent: "Information gatekeeping and hidden costs", elora: "100% transparency. No secrets, no hidden agendas.", icon: ShieldCheck },
  { feature: "Risk", agent: "High risk of misrepresentation and errors", elora: "AI document review as your safety net before you submit.", icon: Globe },
  { feature: "Long-term value", agent: "One-off service, dependent on the agent", elora: "Lifelong skills to handle any future visa yourself.", icon: BookOpen },
]

export function ComparisonSection() {
  return (
    <section className="relative bg-lp-page px-3 py-16 md:px-5 md:py-24" aria-labelledby="compare-heading">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <Reveal>
            <Eyebrow>Beyond the traditional</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <Display as="h2" size="lg" className="mt-5 text-lp-fg">
              <span id="compare-heading">
                Not an alternative. <span className="text-lp-azure">An evolution.</span>
              </span>
            </Display>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-lp-muted md:text-base">
              Here&apos;s how preparing with Elora Visa compares with handing everything to an agent.
            </p>
          </Reveal>
        </div>

        <Reveal scale y={40} amount={0.1}>
          <div className="overflow-hidden rounded-[2rem] border border-lp-line bg-lp-card lp-shadow">
            {/* Header (desktop) */}
            <div className="hidden grid-cols-[1.1fr_1fr_1.2fr] border-b border-lp-line md:grid">
              <div className="px-8 py-5 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-lp-muted">
                What matters
              </div>
              <div className="flex items-center gap-2 px-8 py-5 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-lp-muted">
                <X className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
                Traditional agents
              </div>
              <div className="flex items-center gap-2 bg-lp-navy px-8 py-5 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-white">
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                Elora Visa
              </div>
            </div>

            <RevealGroup amount={0.05}>
              {ROWS.map((row, i) => (
                <RevealItem key={row.feature}>
                  <div className="grid grid-cols-1 border-b border-lp-line last:border-b-0 md:grid-cols-[1.1fr_1fr_1.2fr]">
                    <div className="flex items-center gap-3 px-6 pt-6 md:px-8 md:py-6">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lp-sky-2 text-lp-azure">
                        <row.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="font-display text-xs font-semibold uppercase tracking-wide text-lp-fg md:text-sm">
                        {row.feature}
                      </span>
                      <span className="ml-auto font-display text-[10px] text-lp-muted/60 md:hidden">0{i + 1}</span>
                    </div>
                    <div className="px-6 pt-4 text-sm text-lp-muted md:flex md:items-center md:px-8 md:py-6">
                      <span className="mr-2 inline-flex items-center gap-1 font-display text-[9px] uppercase tracking-widest text-rose-500 md:hidden">
                        <X className="h-3 w-3" aria-hidden="true" /> Agents
                      </span>
                      <span className="italic">{row.agent}</span>
                    </div>
                    <div className="mt-4 bg-lp-navy px-6 py-5 text-sm font-medium text-white md:mt-0 md:flex md:items-center md:px-8 md:py-6">
                      <span className="mr-2 inline-flex items-center gap-1 font-display text-[9px] uppercase tracking-widest text-emerald-400 md:hidden">
                        <Check className="h-3 w-3" aria-hidden="true" /> Elora
                      </span>
                      {row.elora}
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Reveal>

        <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="font-display text-[10px] font-medium uppercase tracking-[0.2em] text-lp-muted">Experience the difference</p>
          <PillLink href="#pricing" variant="navy" size="lg">
            Start your journey
          </PillLink>
        </Reveal>
      </div>
    </section>
  )
}
