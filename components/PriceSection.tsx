"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type Feature = {
  name: string;
  included: boolean;
};

type Plan = {
  name: string;
  price: string;
  cadence?: string;
  description: string;
  features: Feature[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  color: string;
};

const plans: Plan[] = [
  {
    name: "Basic Plan",
    price: "$0",
    cadence: "/mo",
    description: "Perfect for exploring the platform",
    features: [
      { name: "10 Tokens", included: true },
      { name: "AI Chatbot Assistant", included: false },
      { name: "Document Review", included: true },
      { name: "Special Telegram Group", included: false },
      { name: "One AI Mock Interview", included: true },
      { name: "Document Storage", included: true },
    ],
    cta: "Get started",
    color: "blue"
  },
  {
    name: "Pro Plan",
    price: "$20",
    cadence: "/mo",
    description: "Most popular for active applicants",
    features: [
      { name: "100 AI Tokens", included: true },
      { name: "Limited AI Chatbot Access", included: true },
      { name: "Document Review", included: true },
      { name: "Special Telegram Group", included: false },
      { name: "Multiple AI Mock Interviews", included: true },
      { name: "Document Storage", included: true },
    ],
    cta: "Upgrade to Pro",
    highlight: true,
    badge: "Most Popular",
    color: "indigo"
  },
  {
    name: "Full Features",
    price: "$40",
    cadence: "/mo",
    description: "Everything you need for success",
    features: [
      { name: "200 AI Tokens", included: true },
      { name: "Full AI Chatbot Access", included: true },
      { name: "Document Review", included: true },
      { name: "Special Telegram Group", included: true },
      { name: "Multiple AI mock interviews", included: true },
      { name: "Document Storage", included: true },
    ],
    cta: "Boost your application",
    color: "purple"
  },
];

export default function PriceSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".price-header", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          toggleActions: "play none none none"
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all"
      });

      gsap.from(".price-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          toggleActions: "play none none none"
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
        clearProps: "all"
      });
    }, containerRef);

    return () => ctx.revert();
  }, [mounted]);

  return (
    <section ref={containerRef} className="relative py-24 md:py-32 overflow-hidden bg-slate-50/50 dark:bg-[#030308]/50">

      <div className="container relative z-10 px-4 mx-auto">
        <div className="price-header text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Simple, Transparent{" "}
            </span>
            <span className="text-foreground">Pricing</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-xl">
            Choose the plan that's right for your ambition. No hidden fees, ever.
          </p>
        </div>

        <div className="price-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={cn(
                "price-card relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border transition-all duration-500 flex flex-col group",
                plan.highlight 
                  ? "border-blue-500/50 shadow-[0_20px_50px_rgba(59,130,246,0.15)] scale-105 z-10 dark:bg-slate-900/80" 
                  : "border-slate-200 dark:border-slate-800 hover:border-blue-500/30 shadow-xl hover:shadow-2xl"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {plan.badge}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.cadence}</span>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className={cn("flex items-start gap-3 text-sm", !feature.included && "opacity-40")}>
                    {feature.included ? (
                      <div className="mt-0.5 p-0.5 rounded-full bg-blue-500/10 text-blue-500">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="mt-0.5 p-0.5 rounded-full bg-slate-500/10 text-slate-500">
                        <X className="w-4 h-4" />
                      </div>
                    )}
                    <span className={cn(feature.included ? "text-foreground/90 font-medium" : "text-muted-foreground line-through")}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300",
                  plan.highlight
                    ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-500/25"
                    : "bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-blue-500 hover:text-white"
                )}
              >
                {plan.cta}
              </button>

              {plan.highlight && (
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
        
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Prices in USD. All plans include 24/7 basic support.
        </p>
      </div>
    </section>
  );
}
