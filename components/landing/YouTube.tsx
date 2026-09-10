import { PlayCircle } from "lucide-react"
import { Display, Eyebrow, Reveal } from "./ui"

export function YouTube() {
  return (
    <section className="relative bg-lp-page py-16 md:py-24" aria-labelledby="video-heading">
      <div className="container relative mx-auto px-4 text-center md:px-6">
        <div className="mx-auto mb-10 max-w-2xl md:mb-14">
          <Reveal>
            <Eyebrow>
              <PlayCircle className="h-3 w-3 text-lp-azure" aria-hidden="true" />
              Watch the tutorial
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <Display as="h2" size="lg" className="mt-5 text-lp-fg">
              <span id="video-heading">See Elora in action</span>
            </Display>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-lp-muted md:text-base">
              Take a deep dive into Elora Visa and see exactly how the platform helps you take full control of your
              application.
            </p>
          </Reveal>
        </div>

        <Reveal scale y={50} amount={0.2}>
          <div className="relative mx-auto max-w-5xl">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[3rem] bg-gradient-to-b from-lp-sky to-transparent opacity-80 blur-2xl dark:opacity-40"
            />
            <div className="relative aspect-video overflow-hidden rounded-[2rem] border-[6px] border-lp-card bg-lp-navy lp-shadow md:border-8">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/OhV11JYsiWw?si=U4NrAz0jZMQabq3x"
                title="Elora Visa tutorial video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
