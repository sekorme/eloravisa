import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import PricingSection from "@/components/PriceSection"
import { FAQAccordion } from "@/components/landing/FAQAccordion"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare Elora Visa plans, included AI tokens and preparation tools with clear USD pricing.",
}

export default function PricingPage() {
  return (
    <MarketingPageShell
      eyebrow="Transparent pricing"
      title="Choose the preparation support that fits your journey."
      description="Start free, understand exactly what your AI tokens cover and upgrade when you need more preparation tools."
    >
      <PricingSection />
      <FAQAccordion />
    </MarketingPageShell>
  )
}
