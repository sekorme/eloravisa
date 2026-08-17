import type { Metadata } from "next"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { YouTube } from "@/components/landing/YouTube"
import { FAQAccordion } from "@/components/landing/FAQAccordion"

export const metadata: Metadata = {
  title: "How Elora Visa Works",
  description: "See how Elora Visa turns your visa goal into a clear checklist, document preparation plan and realistic interview practice.",
}

export default function HowItWorksPage() {
  return (
    <MarketingPageShell
      eyebrow="Your preparation journey"
      title="A clear path from visa goal to submission readiness."
      description="Understand each stage, organize your requirements and prepare confidently while keeping full control of your application."
    >
      <HowItWorksSection />
      <YouTube />
      <FAQAccordion />
    </MarketingPageShell>
  )
}
