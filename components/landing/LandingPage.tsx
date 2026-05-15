"use client"

import React from "react"
import { HeroSection } from "./HeroSection"
import  {TargetAudienceSection}  from "./TargetAudienceSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { FeaturesSection } from "./FeaturesSection"
import { YouTube } from "./YouTube"
import { ComparisonSection } from "./ComparisonSection"
import { TrustSection } from "./TrustSection"
import { FinalCTASection } from "./FinalCTASection"
import PricingSection from "@/components/PriceSection"
import {Testimonial} from "@/components/landing/Testimonial";

import { GlobalThreeBackground } from "./GlobalThreeBackground"

import { Footer } from "./Footer"




export function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <GlobalThreeBackground />
      <HeroSection/>

      <TargetAudienceSection />
      <HowItWorksSection />

      <FeaturesSection />
      <YouTube />
      <ComparisonSection />
      <Testimonial />
      <TrustSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
