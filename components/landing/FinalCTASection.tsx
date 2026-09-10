import { ArrowRight, Check, Compass } from "lucide-react"
import { CTA, FINAL_CTA } from "@/lib/landing/content"
import { TrackedLink } from "./TrackedLink"
import { Display, Eyebrow } from "./ui"

/** The full CTA is server visible and works before animation or JavaScript. */
export function FinalCTASection() {
  return (
    <section className="relative bg-lp-page px-3 pb-8 pt-12 sm:px-5 md:pb-12 md:pt-20" aria-labelledby="cta-heading">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[2rem] bg-[#071426] px-5 py-20 text-center text-white sm:rounded-[2.5rem] sm:px-8 md:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(124,58,237,0.5),transparent_65%),radial-gradient(ellipse_at_85%_100%,rgba(34,211,238,0.22),transparent_50%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[530px] w-[380px] -translate-x-1/2 -translate-y-1/2 rotate-[16deg] rounded-[3rem] border border-white/[0.06]" />
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-emerald-300/25" viewBox="0 0 1400 680" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M-70 630C250 690 345 340 690 530S1080 560 1400 110" stroke="currentColor" strokeWidth="1" />
          <path d="M-70 650C250 710 345 360 690 550S1080 580 1400 130" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <circle cx="1158" cy="362" r="5" fill="#22D3EE" stroke="white" strokeWidth="2" />
          <circle cx="1158" cy="362" r="17" stroke="#22D3EE" opacity="0.3" />
        </svg>
        <div className="relative mx-auto flex max-w-3xl flex-col items-center">
          <Eyebrow tone="dark"><Compass className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" /> Your next chapter</Eyebrow>
          <Display as="h2" size="xl" className="mt-7"><span id="cta-heading">{FINAL_CTA.headline}</span></Display>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{FINAL_CTA.supporting}</p>
          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <TrackedLink href="/signup" eventParams={{ location: "final_cta", label: "start_preparing" }} magnetic className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#071426] shadow-lg shadow-black/10 transition-transform motion-safe:hover:-translate-y-0.5 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#071426] sm:px-7 sm:text-base">
              {CTA.primary}<ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
            </TrackedLink>
            <TrackedLink href="/#ai-tools" eventParams={{ location: "final_cta", label: "explore_tools" }} className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:px-7 sm:text-base">
              {FINAL_CTA.secondary}
            </TrackedLink>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-300 sm:text-sm"><Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" /> Free to start. No credit card required.</p>
          <p className="mt-12 text-xs leading-6 text-slate-400">Greater preparation. Clearer next steps. Visa outcomes remain with the relevant authority.</p>
        </div>
      </div>
    </section>
  )
}
