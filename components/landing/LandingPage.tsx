import React from "react"
import { HeroSection } from "./HeroSection"
import  {TargetAudienceSection}  from "./TargetAudienceSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { AIToolsBento } from "./AIToolsBento"
import { YouTube } from "./YouTube"
import { ComparisonSection } from "./ComparisonSection"
import { TrustSection } from "./TrustSection"
import { FinalCTASection } from "./FinalCTASection"
import PricingSection from "@/components/PriceSection"
import {Testimonial} from "@/components/landing/Testimonial";
import { TrustMetrics } from "./TrustMetrics"
import { JourneySelector } from "./JourneySelector"
import { AffiliatePreview } from "./AffiliatePreview"
import { FAQAccordion } from "./FAQAccordion"
import HomePage from "@/components/home/HomePage"

import { GlobalThreeBackground } from "./GlobalThreeBackground"

import { Footer } from "./Footer"




export function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">



      <HeroSection/>

      <TrustMetrics />
      <JourneySelector />
      <TargetAudienceSection />
      <HowItWorksSection />


      <AIToolsBento />
      <YouTube />
      <ComparisonSection />
      <AffiliatePreview />
      <Testimonial />
      <TrustSection />
      <PricingSection />
      <FAQAccordion />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
