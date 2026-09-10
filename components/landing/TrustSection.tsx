import Link from "next/link"
import { ArrowUpRight, Bot, FileCheck2, Fingerprint, FolderOpen, Info, KeyRound, MessageCircle, ShieldCheck } from "lucide-react"
import { PREPARATION_POLICY_LINKS, TRUST_MEASURES } from "@/lib/landing/conversion-content"
import { Display, Eyebrow, Reveal } from "./ui"

const ICONS = {
  signin: KeyRound,
  documents: FolderOpen,
  privacy: Fingerprint,
  ai: Bot,
  consent: FileCheck2,
  deletion: MessageCircle,
} as const

export function TrustSection() {
  return (
    <section id="security" className="relative scroll-mt-28 bg-lp-page px-5 py-20 sm:px-6 md:py-28" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <Eyebrow><ShieldCheck className="h-3.5 w-3.5 text-lp-azure" aria-hidden="true" /> Built on clarity</Eyebrow>
            <Display as="h2" size="lg" className="mt-6 max-w-2xl text-lp-fg">
              <span id="trust-heading">Your application information deserves serious protection.</span>
            </Display>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-lp-muted">
              Personal documents. Important decisions. You deserve to understand how your information is used and where our guidance ends.
            </p>
          </div>

          <Reveal className="relative mx-auto flex aspect-[1.2] w-full max-w-sm items-center justify-center" y={12}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-4 rounded-full border border-lp-azure/10" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-12 rounded-full border border-lp-azure/15 bg-lp-azure/[0.03]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-20 rounded-full border border-lp-azure/15" />
            <div className="relative w-44 rotate-[-7deg] rounded-2xl border border-lp-line bg-lp-card p-5 shadow-[0_24px_64px_-24px_rgba(37,99,235,0.3)] sm:w-48">
              <div aria-hidden="true" className="mb-7 flex items-center justify-between">
                <FileCheck2 className="h-7 w-7 text-lp-azure" />
                <span className="h-1.5 w-9 rounded-full bg-lp-line" />
              </div>
              <span className="font-display text-sm font-semibold text-lp-fg">Your preparation</span>
              <div aria-hidden="true" className="mt-4 space-y-2.5">
                <div className="h-1.5 w-full rounded-full bg-lp-line" />
                <div className="h-1.5 w-4/5 rounded-full bg-lp-line" />
                <div className="h-1.5 w-full rounded-full bg-lp-line" />
                <div className="h-1.5 w-3/5 rounded-full bg-lp-azure/20" />
              </div>
              <div className="mt-7 border-t border-lp-line pt-3 text-[11px] text-lp-muted">Clear tools. Clear boundaries.</div>
            </div>
            <span aria-hidden="true" className="absolute bottom-12 right-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-lp-line bg-lp-card text-lp-azure shadow-lg shadow-lp-azure/10">
              <Fingerprint className="h-7 w-7" />
            </span>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-12">
          {TRUST_MEASURES.map((measure) => {
            const Icon = ICONS[measure.icon]
            return (
              <article key={measure.title} className="border-t border-lp-line pt-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-lp-azure/[0.07] text-lp-azure">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-base font-semibold text-lp-fg">{measure.title}</h3>
                <p className="mt-2.5 max-w-sm text-sm leading-7 text-lp-muted">{measure.description}</p>
              </article>
            )
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-lp-line bg-lp-card px-5 py-5 sm:px-7">
          <nav aria-label="Security and legal policies" className="flex flex-wrap gap-x-7 gap-y-1">
            {PREPARATION_POLICY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="group inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-lp-fg underline-offset-4 hover:text-lp-azure hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure">
                {link.label}<ArrowUpRight className="h-3.5 w-3.5 text-lp-muted transition-transform motion-safe:group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <p className="mt-4 flex items-start gap-2.5 border-t border-lp-line pt-5 text-xs leading-6 text-lp-muted">
            <Info className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Elora Visa provides educational preparation tools, not legal advice. No online service can guarantee absolute security. Visa decisions remain with the relevant immigration authority.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
