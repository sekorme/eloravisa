import Image from "next/image"
import { User, AlertTriangle, GraduationCap, Shield, type LucideIcon } from "lucide-react"
import { Display, Eyebrow, Reveal, RevealGroup, RevealItem, TabCard } from "./ui"

type Audience = {
  icon: LucideIcon
  image: string
  title: string
  subtitle: string
  desc: string
}

const AUDIENCES: Audience[] = [
  {
    icon: User,
    image: "/firsttime.png",
    title: "First-time applicants",
    subtitle: "A smooth start to your new chapter.",
    desc: "The visa application process can be daunting, but it doesn't have to be. We simplify the complexities with a clear roadmap from your initial idea to your submission, so you never miss a detail.",
  },
  {
    icon: AlertTriangle,
    image: "/pastrefusal.png",
    title: "Past refusals",
    subtitle: "Turning setbacks into success.",
    desc: "A previous rejection isn't the end of the road. Understand what went wrong, address the root causes and strengthen your application strategy before you reapply.",
  },
  {
    icon: GraduationCap,
    image: "/studentworker.png",
    title: "Students & workers",
    subtitle: "Bridging the gap to global opportunities.",
    desc: "Whether you're pursuing a degree or a career abroad, get guidance tailored to study permits and work visas, from institutional requirements to supporting evidence.",
  },
  {
    icon: Shield,
    image: "/tiredofagent.png",
    title: "Tired of agents",
    subtitle: "Take full control of your application.",
    desc: "Say goodbye to middlemen and hidden fees. Get the knowledge and tools to handle your own application with total transparency and stay in the driver's seat.",
  },
]

export function TargetAudienceSection() {
  return (
    <section className="relative bg-lp-page py-16 md:py-24" aria-labelledby="audience-heading">
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <Reveal>
            <Eyebrow>Who we serve</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <Display as="h2" size="lg" className="mt-5 text-lp-fg">
              <span id="audience-heading">Designed for every journey</span>
            </Display>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-lp-muted md:text-base">
              Whether you&apos;re starting fresh or recovering from a setback, Elora Visa gives you the tools to prepare
              a stronger application yourself.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-6 md:gap-y-12">
          {AUDIENCES.map((item, index) => (
            <RevealItem key={item.title} className="group">
              <TabCard
                tab={
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lp-azure text-white">
                      <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
                      0{index + 1}
                    </span>
                  </span>
                }
                bodyClassName="lp-shadow overflow-hidden"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lp-card via-transparent to-transparent" aria-hidden="true" />
                </div>
                <div className="p-6 md:p-8">
                  <Display as="h3" size="sm" className="text-lp-fg">
                    {item.title}
                  </Display>
                  <p className="mt-2 text-sm font-semibold text-lp-azure">{item.subtitle}</p>
                  <p className="mt-4 text-sm leading-relaxed text-lp-muted md:text-[15px]">{item.desc}</p>
                </div>
              </TabCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
