import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, FileText, Mic2, RotateCcw, ShieldCheck, Sparkles } from "lucide-react"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"

export const metadata: Metadata = {
  title: "Visa Preparation Resources",
  description: "Explore practical educational resources for visa documents, interviews, refusals and secure self-guided preparation.",
}

const RESOURCES = [
  { icon: FileText, category: "Documents", title: "How to organize a clear visa document pack", description: "A practical framework for naming, checking and arranging your evidence before review." },
  { icon: Mic2, category: "Interview", title: "Preparing truthful, complete interview answers", description: "Learn how to structure answers around your real circumstances without memorizing a script." },
  { icon: RotateCcw, category: "Reapplication", title: "What to review after a visa refusal", description: "A calm checklist for understanding concerns and identifying what has materially changed." },
  { icon: ShieldCheck, category: "Security", title: "Handling sensitive application documents safely", description: "Simple habits that help protect personal information throughout your preparation." },
  { icon: Sparkles, category: "AI tools", title: "How to use AI feedback responsibly", description: "Treat AI suggestions as preparation support while keeping every claim accurate and personal." },
  { icon: BookOpen, category: "Planning", title: "Building a visa preparation timeline", description: "Map requirements, document dependencies and review time without leaving critical work too late." },
]

export default function ResourcesPage() {
  return (
    <MarketingPageShell
      eyebrow="Preparation library"
      title="Clear, practical resources for a better prepared application."
      description="Learn at your own pace with educational guides designed around documents, interviews, planning and responsible use of AI."
    >
      <section className="px-4 py-20 md:px-6 md:py-28">
        <div className="container mx-auto">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((resource) => (
              <article key={resource.title} className="group flex min-h-72 flex-col rounded-3xl border border-border bg-card p-7 transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-landing-blue dark:text-landing-cyan">{resource.category}</span>
                  <resource.icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <h2 className="mt-8 text-2xl font-bold tracking-tight">{resource.title}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{resource.description}</p>
                <Link href="/ai-tools" className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-landing-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue dark:text-landing-cyan">
                  Explore preparation tools
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  )
}
