import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { Testimonial } from "@/components/landing/Testimonial"
import { TrustSection } from "@/components/landing/TrustSection"

export const metadata: Metadata = {
  title: "Success Stories",
  description: "Read verified stories from applicants who used Elora Visa to prepare more clearly and confidently.",
}

export default function SuccessStoriesPage() {
  return (
    <MarketingPageShell
      eyebrow="Applicant experiences"
      title="Real people. Better prepared applications."
      description="Learn how applicants used Elora Visa tools to organize their documents, understand the process and prepare with greater confidence."
    >
      <Testimonial />
      <TrustSection />
    </MarketingPageShell>
  )
}
