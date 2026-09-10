import { FileSearch, ListChecks, Mic } from "lucide-react"
import { HeroGlobeFallback } from "./HeroGlobeFallback"
import { Display, Eyebrow, PillLink, Reveal, RevealGroup, RevealItem } from "./ui"

const PILLARS = [
  { icon: FileSearch, label: "AI document review" },
  { icon: Mic, label: "Mock interviews" },
  { icon: ListChecks, label: "Personal checklist" },
]

/**
 * The section the hero globe flies into. The globe lands on the top edge of
 * the navy card, in a concave notch cut with a page-coloured circle.
 */
export function GlobalReachSection() {
  return (
    <section className="relative bg-lp-page px-3 pb-8 pt-40 md:px-5 md:pb-12 md:pt-56" aria-labelledby="reach-heading">
      <div className="container relative mx-auto">
        <div className="relative rounded-[2.5rem] bg-lp-navy px-6 pb-14 pt-40 text-center text-white md:rounded-[3rem] md:pb-20 md:pt-56 lg:px-12">
          {/* Notch */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 aspect-square w-[calc(min(72vw,260px)*1.12)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lp-page md:w-[calc(340px*1.12)] lg:w-[calc(400px*1.12)]"
          />
          {/* Landing slot for the travelling globe */}
          <div
            data-globe-slot="target"
            className="absolute left-1/2 top-0 aspect-square w-[min(72vw,260px)] -translate-x-1/2 -translate-y-1/2 md:w-[340px] lg:w-[400px]"
          >
            {/* Reduced-motion users don't get the flying globe, so show a static one here. */}
            <div className="hidden h-full w-full motion-reduce:block">
              <HeroGlobeFallback />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem] md:rounded-[3rem]" aria-hidden="true">
            <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-lp-azure/25 blur-3xl" />
            <div className="absolute -right-10 top-1/3 h-64 w-64 rounded-full bg-landing-violet/20 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <Reveal>
              <Eyebrow tone="dark">Global reach</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <Display as="h2" size="lg" className="mt-6">
                <span id="reach-heading">
                  Grow beyond
                  <br />
                  borders with Elora
                </span>
              </Display>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                Whether you&apos;re applying to study, work or visit, Elora Visa helps you prepare a clearer, stronger
                application yourself, with no agent fees or hidden processing costs.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex justify-center">
                <PillLink href="/how-it-works" variant="outline-white">
                  Explore more
                </PillLink>
              </div>
            </Reveal>

            <RevealGroup className="mt-12 grid gap-3 sm:grid-cols-3">
              {PILLARS.map((p) => (
                <RevealItem key={p.label}>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                      <p.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold">{p.label}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  )
}
