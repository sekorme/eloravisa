import type { Metadata } from "next"
import Image from "next/image"
import { Eye, HandHeart, LockKeyhole, UserRoundCheck } from "lucide-react"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"

export const metadata: Metadata = {
  title: "About Elora Visa",
  description: "Learn why Elora Visa was created and how the platform makes visa preparation clearer, more transparent and self-directed.",
}

const PRINCIPLES = [
  { icon: Eye, title: "Transparency", description: "Applicants should understand each step, each cost and what every tool can and cannot do." },
  { icon: UserRoundCheck, title: "Applicant ownership", description: "You remain responsible for your information and in control of your application." },
  { icon: HandHeart, title: "Support without pressure", description: "Preparation guidance should feel clear, respectful and grounded in your real circumstances." },
  { icon: LockKeyhole, title: "Responsible technology", description: "AI should organize and clarify preparation, never fabricate facts or promise outcomes." },
]

export default function AboutPage() {
  return (
    <MarketingPageShell
      eyebrow="Why Elora Visa exists"
      title="Visa preparation should feel clear, not hidden behind a black box."
      description="Elora Visa was built to give applicants practical knowledge, intelligent preparation tools and the confidence to remain in control of their own journey."
    >
      <section className="px-4 py-20 md:px-6 md:py-28">
        <div className="container mx-auto grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900">
            <Image src="/IMG_9093.jpg" alt="The Elora Visa founder" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-blue dark:text-landing-cyan">Our mission</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Make preparation knowledge easier to access.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">We combine structured guidance, realistic practice and AI-assisted review so applicants can organize their work, ask better questions and submit their own applications with greater clarity.</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Elora Visa is not a travel agency, law firm, immigration consultancy, embassy or government institution. We provide self-help educational tools and do not guarantee visa outcomes.</p>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 md:px-6 md:py-28">
        <div className="container mx-auto grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((principle) => (
            <article key={principle.title} className="rounded-3xl border border-border bg-background p-6">
              <principle.icon className="h-6 w-6 text-landing-blue dark:text-landing-cyan" aria-hidden="true" />
              <h3 className="mt-6 text-xl font-bold">{principle.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{principle.description}</p>
            </article>
          ))}
        </div>
      </section>
    </MarketingPageShell>
  )
}
