import Link from "next/link"
import { Tag, LineChart, Wallet, BarChart3, ArrowRight } from "lucide-react"

const POINTS = [
  { icon: Tag, label: "Unique promo code" },
  { icon: LineChart, label: "Referral tracking" },
  { icon: BarChart3, label: "Commission dashboard" },
  { icon: Wallet, label: "Withdrawal requests" },
]

export function AffiliatePreview() {
  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-border bg-gradient-to-br from-landing-cyan/5 via-landing-blue/5 to-landing-violet/5 p-8 md:p-14 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-landing-cyan/10 text-landing-blue dark:text-landing-cyan border-landing-cyan/30 mb-6">
            Affiliate Program
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Earn by helping others discover smarter visa preparation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
            Share your unique promo code and earn 10% commission on every successful referral payment.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {POINTS.map((p) => (
              <div key={p.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-border">
                <p.icon className="w-4 h-4 text-landing-blue dark:text-landing-cyan" />
                <span className="text-sm font-medium">{p.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/affiliate"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-gradient-to-r from-landing-cyan via-landing-blue to-landing-violet text-white font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto justify-center"
            >
              Become an Affiliate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/affiliate/signin"
              className="inline-flex items-center justify-center h-12 px-8 rounded-full border-2 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full sm:w-auto"
            >
              Affiliate Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
