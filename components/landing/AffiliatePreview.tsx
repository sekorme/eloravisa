import { Tag, LineChart, Wallet, BarChart3, Percent } from "lucide-react"
import { Display, PillLink, Reveal, TabCard } from "./ui"

const POINTS = [
  { icon: Tag, label: "Unique promo code" },
  { icon: LineChart, label: "Referral tracking" },
  { icon: BarChart3, label: "Commission dashboard" },
  { icon: Wallet, label: "Withdrawal requests" },
]

export function AffiliatePreview() {
  return (
    <section className="relative bg-lp-page py-16 md:py-24" aria-labelledby="affiliate-heading">
      <div className="container mx-auto px-4 md:px-6">
        <Reveal scale y={40} amount={0.2} className="mx-auto max-w-5xl">
          <TabCard
            tab={
              <span className="flex items-center gap-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-fg/80">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lp-azure text-white">
                  <Percent className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Affiliate program
              </span>
            }
            bodyClassName="lp-shadow relative overflow-hidden p-8 md:p-14"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lp-sky blur-3xl dark:bg-lp-azure/20" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <Display as="h2" size="md" className="text-lp-fg">
                  <span id="affiliate-heading">Earn by sharing Elora Visa</span>
                </Display>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-lp-muted md:text-base">
                  Help others discover smarter visa preparation. Share your unique promo code and earn{" "}
                  <strong className="font-semibold text-lp-fg">10% commission</strong> on every successful referral payment.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PillLink href="/affiliate" variant="azure">
                    Become an affiliate
                  </PillLink>
                  <PillLink href="/affiliate/signin" variant="outline" arrow={false}>
                    Affiliate sign in
                  </PillLink>
                </div>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {POINTS.map((p, i) => (
                  <li
                    key={p.label}
                    className="flex items-center gap-3 rounded-2xl border border-lp-line bg-lp-card-2 px-4 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lp-navy text-white">
                      <p.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-lp-fg">{p.label}</span>
                    <span className="ml-auto font-display text-[10px] text-lp-muted/60">0{i + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabCard>
        </Reveal>
      </div>
    </section>
  )
}
