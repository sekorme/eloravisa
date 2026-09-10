import { getPublicStats } from "@/lib/publicStats"
import { GlobeJourney } from "./GlobeJourney"
import { HeroSection } from "./HeroSection"
import { DestinationRibbon } from "./DestinationRibbon"
import { GlobalReachSection } from "./GlobalReachSection"
import { ProblemSolutionSection } from "./ProblemSolutionSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { AIToolsBento } from "./AIToolsBento"
import { MockInterviewSpotlight } from "./MockInterviewSpotlight"
import { DocumentReadinessDemo } from "./DocumentReadinessDemo"
import { JourneySelector } from "./JourneySelector"
import { TargetAudienceSection } from "./TargetAudienceSection"
import { LiveClassesSection } from "./LiveClassesSection"
import { TrustMetrics } from "./TrustMetrics"
import { Testimonial } from "./Testimonial"
import { YouTube } from "./YouTube"
import { ComparisonSection } from "./ComparisonSection"
import { TrustSection } from "./TrustSection"
import PricingSection from "@/components/PriceSection"
import { AffiliatePreview } from "./AffiliatePreview"
import { FAQAccordion } from "./FAQAccordion"
import { FinalCTASection } from "./FinalCTASection"
import { Footer } from "./Footer"
import { StructuredData } from "./StructuredData"

/**
 * The homepage, composed top to bottom. Section order follows the applicant's
 * own arc: what they want → what's hard about it → how Elora helps → proof →
 * price → questions → start.
 *
 * `getPublicStats()` returns aggregate counts only, and omits any metric it
 * can't read; sections that take `stats` must render nothing rather than a
 * placeholder number when a metric is missing.
 */
export async function LandingPage() {
  const stats = await getPublicStats()

  return (
    <div className="landing-page relative min-h-screen overflow-x-clip bg-lp-page text-lp-fg">
      <StructuredData />

      {/* One shared globe flies from the hero into GlobalReachSection, so both
          sections (and the ribbon between them) live inside GlobeJourney. */}
      <GlobeJourney>
        <HeroSection stats={stats} />
        <DestinationRibbon />
        <GlobalReachSection />
      </GlobeJourney>

      {/* The problem, then the path through it. */}
      <ProblemSolutionSection />
      <HowItWorksSection />

      {/* The tools themselves, then two of them shown properly. */}
      <AIToolsBento />
      <MockInterviewSpotlight />
      <DocumentReadinessDemo />

      {/* Who it's for. */}
      <JourneySelector />
      <TargetAudienceSection />
      <LiveClassesSection />

      {/* Proof — verified stats and approved testimonials only. */}
      <TrustMetrics stats={stats} />
      <Testimonial />
      <YouTube />
      <ComparisonSection />

      {/* Security, price, questions, and the final ask. */}
      <TrustSection />
      <PricingSection />
      <AffiliatePreview />
      <FAQAccordion />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
