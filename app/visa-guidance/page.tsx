import type { Metadata } from "next"
import { BriefcaseBusiness, GraduationCap, Plane, RotateCcw, FileCheck2, Mic2 } from "lucide-react"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"

export const metadata: Metadata = {
  title: "Visa Guidance",
  description: "Explore educational preparation guidance for study, work and visitor visas, interviews and reapplications after refusal.",
}

const GUIDANCE_AREAS = [
  {
    icon: GraduationCap,
    title: "Study visa preparation",
    description: "Organize academic, financial and supporting evidence around your destination and course objectives.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Work visa preparation",
    description: "Understand the documents and explanations commonly needed to support an international employment objective.",
  },
  {
    icon: Plane,
    title: "Visitor visa preparation",
    description: "Build a clear preparation plan around purpose of travel, funding, accommodation and reasons to return.",
  },
  {
    icon: RotateCcw,
    title: "Reapplying after refusal",
    description: "Review previous concerns, identify weak evidence and document meaningful changes before applying again.",
  },
  {
    icon: FileCheck2,
    title: "Document readiness",
    description: "Check that information is complete, consistent and supported before you submit anything yourself.",
  },
  {
    icon: Mic2,
    title: "Interview preparation",
    description: "Practise explaining your circumstances clearly, truthfully and confidently in a realistic interview format.",
  },
]

export default function VisaGuidancePage() {
  return (
    <MarketingPageShell
      eyebrow="Educational visa guidance"
      title="Understand what to prepare before you apply."
      description="Build knowledge around your visa objective, organize the right questions and create a preparation plan suited to your circumstances."
    >
      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 md:px-6 md:py-28">
        <div className="container mx-auto">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">Choose your preparation area</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Guidance is educational and should always be checked against the latest official requirements for your destination and visa category.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {GUIDANCE_AREAS.map((area) => (
              <article key={area.title} className="rounded-3xl border border-border bg-background p-6 shadow-sm md:p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-landing-blue/10 text-landing-blue dark:bg-landing-cyan/10 dark:text-landing-cyan">
                  <area.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold">{area.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{area.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-3xl border border-landing-cyan/20 bg-landing-navy p-6 text-white md:p-10">
            <p className="text-sm leading-relaxed text-white/70">Elora Visa provides self-help educational guidance and AI-powered preparation tools. Requirements can change, so confirm current rules with the relevant official immigration authority before submitting an application.</p>
          </div>
        </div>
      </section>
    </MarketingPageShell>
  )
}
