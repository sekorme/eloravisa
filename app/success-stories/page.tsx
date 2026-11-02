import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { Testimonial } from "@/components/landing/Testimonial"
import { TrustSection } from "@/components/landing/TrustSection"
import { getApprovedTestimonials } from "@/lib/testimonials"

// Approved applicant stories change rarely; refresh hourly.
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Success Stories",
  description: "Read verified stories from applicants who used Elora Visa to prepare more clearly and confidently.",
}

export default async function SuccessStoriesPage() {
  const stories = await getApprovedTestimonials().catch(() => [])
  return (
    <MarketingPageShell
      eyebrow="Applicant experiences"
      title="Stories from applicants who prepared with Elora."
      description="Learn how applicants used Elora Visa tools to organize their documents, understand the process and prepare with greater confidence."
    >
      {stories.length > 0 && (
        <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 md:px-6 md:py-24">
          <div className="container mx-auto">
            <h2 className="mb-10 text-3xl font-black tracking-tight sm:text-4xl">From applicants who got their visa</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((s) => (
                <figure key={s.id} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                  <blockquote className="leading-relaxed">&ldquo;{s.testimonial}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-sm text-muted-foreground">
                    {s.displayName}{s.destination ? ` · ${s.destination}` : ""}{s.visaType ? ` ${s.visaType.toLowerCase()} visa` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
      <Testimonial />
      <TrustSection />
    </MarketingPageShell>
  )
}
