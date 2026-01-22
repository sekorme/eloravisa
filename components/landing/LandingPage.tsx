"use client"

import React from "react"
import { HeroSection } from "./HeroSection"
import  {TargetAudienceSection}  from "./TargetAudienceSection"
import { HowItWorksSection } from "./HowItWorksSection"
import { FeaturesSection } from "./FeaturesSection"
import { ComparisonSection } from "./ComparisonSection"
import { TrustSection } from "./TrustSection"
import { FinalCTASection } from "./FinalCTASection"

import {AnimatedTestimonialsPlus} from "@/components/landing/AnimatedTestimonials";
import { Footer } from "./Footer"
import { GlobeDemo } from "./GlobeDemo"


export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <TargetAudienceSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ComparisonSection />
      <AnimatedTestimonialsPlus />
      <TrustSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
