import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { AIToolsBento } from "@/components/landing/AIToolsBento"
import { TrustSection } from "@/components/landing/TrustSection"
import PricingSection from "@/components/PriceSection"

export const metadata: Metadata = {
  title: "AI Visa Preparation Tools",
  description: "Explore Elora Visa tools for document review, personalized checklists, statement preparation and realistic visa mock interviews.",
}

export default function AIToolsPage() {
  return (
    <MarketingPageShell
      eyebrow="Practical AI preparation"
      title="Powerful tools for every part of your visa preparation."
      description="Review documents, practise interviews and understand your next steps from one secure, self-guided platform."
    >
      <AIToolsBento />
      <TrustSection />
      <PricingSection />
    </MarketingPageShell>
  )
}
