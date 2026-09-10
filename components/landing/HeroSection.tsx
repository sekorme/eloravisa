import { ArrowDown, ArrowRight, Check, FileCheck2, Gauge, Mic, ShieldCheck } from "lucide-react"
import { HERO, CTA, HERO_PREVIEW_CARDS, PREVIEW_LABEL } from "@/lib/landing/content"
import { VisaJourneyScene } from "./VisaJourneyScene"
import { TrackedLink } from "./TrackedLink"
import type { PublicStats } from "@/lib/publicStats"

const previewIcons = { file: FileCheck2, mic: Mic, gauge: Gauge }

export function HeroSection(_props: { stats?: PublicStats }) {
  void _props
  return (
    <section aria-labelledby="hero-heading" className="visa-hero relative isolate overflow-hidden bg-lp-page pt-32 pb-12 lg:pt-40 lg:pb-16">
      <div aria-hidden="true" className="hero-light pointer-events-none absolute inset-0 -z-10" />
      <div className="container mx-auto grid items-center gap-10 px-5 sm:px-8 lg:min-h-[660px] lg:grid-cols-[1.05fr_1fr] lg:gap-4">
        <div className="relative z-10 max-w-2xl">
          <p className="hero-enter mb-6 inline-flex items-center gap-2.5 rounded-full border border-lp-azure/20 bg-lp-card/80 px-4 py-2 text-xs font-semibold tracking-wide text-lp-azure">
            <span className="size-1.5 rounded-full bg-lp-azure" />{HERO.eyebrow}
          </p>
          <h1 id="hero-heading" className="font-display text-[clamp(2.35rem,4.6vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-lp-fg">
            <span className="block overflow-hidden"><span className="hero-title block">{HERO.headline}</span></span>
            <span className="mt-1 block overflow-hidden"><span className="hero-title hero-gradient block">{HERO.headlineAccent}</span></span>
          </h1>
          <p className="hero-enter mt-6 max-w-xl text-base leading-relaxed text-lp-muted sm:text-lg">{HERO.supporting}</p>
          <div className="hero-enter mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink href="/signup" event="hero_cta_primary_click" eventParams={{ location: "hero" }} magnetic className="hero-primary group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-lp-azure px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition-colors hover:bg-lp-azure-2">
              Start Preparing for Free <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </TrackedLink>
            <TrackedLink href="/dashboard/interview-page" event="hero_mock_interview_click" eventParams={{ location: "hero" }} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-lp-fg/25 bg-lp-card/70 px-5 text-sm font-semibold text-lp-fg transition-colors hover:bg-lp-card">
              <Mic className="size-4 text-lp-azure" aria-hidden="true" />Try AI Mock Interview
            </TrackedLink>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-lp-muted">Start free · No credit card required · Upgrade when you’re ready</p>
          <div className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-lp-muted"><ShieldCheck className="size-4 shrink-0 text-lp-azure" aria-hidden="true" /><span>{CTA.trustNote}</span></div>
          <ol aria-label="Your preparation journey" className="mt-7 flex flex-wrap gap-x-3 gap-y-2 border-t border-lp-line pt-6 text-xs text-lp-muted">
            {HERO.journey.map((step, i) => <li key={step} className="flex items-center gap-2"><span className="font-mono text-lp-azure">0{i + 1}</span>{step}{i < 2 && <ArrowRight className="ml-1 size-3 text-lp-muted/60" aria-hidden="true" />}</li>)}
          </ol>
        </div>
        <figure aria-label="Illustration of the visa preparation tools" className="hero-orb relative mx-auto aspect-square w-full max-w-[580px]">
          <div className="absolute inset-[5%] rounded-full border border-lp-azure/10" aria-hidden="true" />
          <div className="absolute inset-[12%] rounded-full border border-dashed border-lp-azure/20" aria-hidden="true" />
          <div className="absolute inset-[7%]"><VisaJourneyScene /></div>
          <div className="hero-passport absolute bottom-[13%] left-[15%] -rotate-12 rounded-2xl border border-white/20 bg-lp-navy p-4 text-white shadow-2xl sm:p-5" aria-hidden="true">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/70">Elora · Journey plan</p>
            <div className="mt-4 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full border border-white/30"><Check className="size-4 text-landing-cyan" /></span><div className="space-y-1.5"><span className="block h-1 w-16 rounded-full bg-white/40" /><span className="block h-1 w-10 rounded-full bg-white/20" /></div></div>
            <p className="mt-4 text-[10px] text-white/70">Your next chapter, organized.</p>
          </div>
          {HERO_PREVIEW_CARDS.map((card, i) => {
            const Icon = previewIcons[card.icon]
            const position = ["top-[11%] left-0", "right-0 top-[43%]", "bottom-[2%] right-[3%]"][i]
            return <div key={card.id} className={`hero-preview absolute ${position} flex items-center gap-2.5 rounded-2xl border border-lp-line bg-lp-card/95 p-3 shadow-xl shadow-slate-950/5 backdrop-blur-sm sm:gap-3 sm:p-4`}>
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${i === 2 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-lp-azure/10 text-lp-azure"}`}><Icon className="size-4" aria-hidden="true" /></span>
              <div><p className="text-[10px] font-medium text-lp-muted sm:text-xs">{card.title}</p><p className="mt-0.5 text-xs font-semibold text-lp-fg sm:text-sm">{card.value}</p></div>
            </div>
          })}
          <figcaption className="absolute -bottom-6 inset-x-0 text-center font-mono text-[10px] uppercase tracking-widest text-lp-muted">{PREVIEW_LABEL} · Illustrative preparation insights</figcaption>
        </figure>
      </div>
      <div className="container mx-auto mt-16 px-5 sm:px-8"><a href="#destinations" className="inline-flex min-h-11 items-center gap-3 text-xs font-medium text-lp-muted"><span className="flex size-8 items-center justify-center rounded-full border border-lp-line"><ArrowDown className="size-3.5" aria-hidden="true" /></span>{HERO.scrollCue}</a></div>
    </section>
  )
}
