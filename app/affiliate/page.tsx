// app/affiliate/page.tsx
"use client"

import Link from "next/image"
import { Button } from "@/components/ui/button"
import { AffiliateBackground } from "@/components/affiliate/AffiliateBackground"
import { ArrowRight, DollarSign, Users, Zap, ShieldCheck } from "lucide-react"
import NextLink from "next/link"

export default function AffiliateLandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <div className="relative flex-1">
        <AffiliateBackground />
        
        <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Partner with <span className="text-primary">Elora Visa</span> and Earn
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Help your audience master their visa applications with AI and earn 10% commission on every successful referral.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 font-semibold">
              <NextLink href="/affiliate/signup">Become an Affiliate</NextLink>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 font-semibold">
              <NextLink href="/affiliate/signin">Sign In to Dashboard</NextLink>
            </Button>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-card p-8 rounded-xl border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">10% Commission</h3>
            <p className="text-muted-foreground">
              Earn a generous 10% commission on every payment made by users you refer. No caps on earnings.
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-xl border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Bonus for Followers</h3>
            <p className="text-muted-foreground">
              Your audience gets 50 EXTRA TOKENS when they use your promo code, giving them more value.
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Easy Tracking</h3>
            <p className="text-muted-foreground">
              Track your referrals, successful payments, and commissions in real-time through your dashboard.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div id="how-it-works" className="bg-muted/30 py-16 px-8 rounded-2xl border mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">1</div>
              <h4 className="font-bold mb-2">Sign Up</h4>
              <p className="text-sm text-muted-foreground">Create your affiliate account in minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">2</div>
              <h4 className="font-bold mb-2">Get Your Code</h4>
              <p className="text-sm text-muted-foreground">We generate a unique promo code for you.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">3</div>
              <h4 className="font-bold mb-2">Share & Refer</h4>
              <p className="text-sm text-muted-foreground">Share the code with your audience on social media.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">4</div>
              <h4 className="font-bold mb-2">Earn Commission</h4>
              <p className="text-sm text-muted-foreground">Get paid every time someone uses your code to subscribe.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">Join the Elora Visa Affiliate Program today and start earning.</p>
          <Button asChild size="lg" className="px-12 rounded-full">
            <NextLink href="/affiliate/signup">Apply Now <ArrowRight className="ml-2 w-4 h-4" /></NextLink>
          </Button>
        </div>
      </main>
      </div>

      <footer className="border-t py-12 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2026 Elora Visa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
