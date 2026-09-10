"use client";

import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS, TOKEN_COSTS } from "@/lib/subscriptions";
import { TrackedLink } from "@/components/landing/TrackedLink";
import { Display, Eyebrow, Reveal, RevealGroup, RevealItem, pillClass } from "@/components/landing/ui";

type Feature = {
  name: string;
  included: boolean;
};

type PlanDisplay = {
  name: string;
  price: number;
  tokens: number;
  cadence: string;
  description: string;
  features: Feature[];
  cta: string;
  highlight?: boolean;
  badge?: string;
};

const reviewsFromTokens = (tokens: number) => Math.floor(tokens / TOKEN_COSTS.DOCUMENT_REVIEW);
const interviewsFromTokens = (tokens: number) => Math.floor(tokens / TOKEN_COSTS.MOCK_INTERVIEW);

// Sourced from lib/subscriptions.ts so pricing here never drifts from what's actually billed.
const plans: PlanDisplay[] = [
  {
    name: SUBSCRIPTION_PLANS.FREE.name,
    price: SUBSCRIPTION_PLANS.FREE.price,
    tokens: SUBSCRIPTION_PLANS.FREE.tokens,
    cadence: "/mo",
    description: "Perfect for exploring the platform",
    features: [
      { name: `${SUBSCRIPTION_PLANS.FREE.tokens} AI tokens per month`, included: true },
      { name: `Up to ${reviewsFromTokens(SUBSCRIPTION_PLANS.FREE.tokens)} document reviews`, included: true },
      { name: `Up to ${interviewsFromTokens(SUBSCRIPTION_PLANS.FREE.tokens)} mock interview`, included: true },
      { name: "AI Chatbot Assistant", included: SUBSCRIPTION_PLANS.FREE.hasChatbot },
      { name: "Private Telegram Group", included: SUBSCRIPTION_PLANS.FREE.hasTelegram },
      { name: "Secure Document Storage", included: true },
    ],
    cta: "Start Free",
  },
  {
    name: SUBSCRIPTION_PLANS.PRO.name,
    price: SUBSCRIPTION_PLANS.PRO.price,
    tokens: SUBSCRIPTION_PLANS.PRO.tokens,
    cadence: "/mo",
    description: "More room for active preparation",
    features: [
      { name: `${SUBSCRIPTION_PLANS.PRO.tokens} AI tokens per month`, included: true },
      { name: `Up to ${reviewsFromTokens(SUBSCRIPTION_PLANS.PRO.tokens)} document reviews`, included: true },
      { name: `Up to ${interviewsFromTokens(SUBSCRIPTION_PLANS.PRO.tokens)} mock interviews`, included: true },
      { name: "AI Chatbot Assistant", included: SUBSCRIPTION_PLANS.PRO.hasChatbot },
      { name: "Private Telegram Group", included: SUBSCRIPTION_PLANS.PRO.hasTelegram },
      { name: "Secure Document Storage", included: true },
    ],
    cta: "Choose Pro",
    highlight: true,
    badge: "Recommended",
  },
  {
    name: SUBSCRIPTION_PLANS.FULL.name,
    price: SUBSCRIPTION_PLANS.FULL.price,
    tokens: SUBSCRIPTION_PLANS.FULL.tokens,
    cadence: "/mo",
    description: "Expanded support for your preparation",
    features: [
      { name: `${SUBSCRIPTION_PLANS.FULL.tokens} AI tokens per month`, included: true },
      { name: `Up to ${reviewsFromTokens(SUBSCRIPTION_PLANS.FULL.tokens)} document reviews`, included: true },
      { name: `Up to ${interviewsFromTokens(SUBSCRIPTION_PLANS.FULL.tokens)} mock interviews`, included: true },
      { name: "AI Chatbot Assistant", included: SUBSCRIPTION_PLANS.FULL.hasChatbot },
      { name: "Private Telegram Group", included: SUBSCRIPTION_PLANS.FULL.hasTelegram },
      { name: "Secure Document Storage", included: true },
    ],
    cta: "Get Full Preparation",
  },
];

export default function PriceSection() {
  return (
    <section id="pricing" className="relative scroll-mt-20 bg-lp-page py-16 md:py-24" aria-labelledby="pricing-heading">
      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <Reveal>
            <Eyebrow>Pricing</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <Display as="h2" size="lg" className="mt-5 text-lp-fg">
              <span id="pricing-heading">
                Start free. <span className="text-lp-azure">Upgrade when you need more support.</span>
              </span>
            </Display>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-lp-muted md:text-base">
              Every plan includes a monthly allowance of AI credits. Prices in USD, billed monthly, and you can change
              plan at any time. Your credits are shared across tools; the maximums below are alternatives, not combined allowances.
            </p>
          </Reveal>
        </div>

        <RevealGroup className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <RevealItem key={plan.name} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-[2rem] border p-7 transition-transform duration-500 md:p-8",
                  plan.highlight
                    ? "border-lp-navy bg-lp-navy text-white shadow-[0_30px_60px_-30px_rgba(12,38,71,0.7)] md:-translate-y-3"
                    : "border-lp-line bg-lp-card text-lp-fg lp-shadow"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-7 flex items-center gap-1 rounded-full bg-lp-azure px-3 py-1 font-display text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide md:text-base">{plan.name}</h3>
                  <p className={cn("mt-1 text-sm", plan.highlight ? "text-white/60" : "text-lp-muted")}>{plan.description}</p>
                </div>

                <div className="mb-7 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-medium">${plan.price}</span>
                  <span className={cn("text-sm", plan.highlight ? "text-white/60" : "text-lp-muted")}>{plan.cadence} USD</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className={cn("flex items-start gap-3 text-sm", !feature.included && "opacity-45")}>
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          feature.included
                            ? plan.highlight
                              ? "bg-white text-lp-navy"
                              : "bg-lp-azure text-white"
                            : plan.highlight
                              ? "bg-white/10 text-white"
                              : "bg-lp-line text-lp-muted"
                        )}
                      >
                        {feature.included ? <Check className="h-3 w-3" aria-hidden="true" /> : <X className="h-3 w-3" aria-hidden="true" />}
                      </span>
                      <span className={cn(feature.included ? "font-medium" : "line-through")}>{feature.name}</span>
                    </li>
                  ))}
                </ul>

                <TrackedLink href="/signup" event="pricing_plan_select" eventParams={{ location: "pricing", label: plan.name, value: plan.price }} className={pillClass(plan.highlight ? "white" : "navy", "md", "w-full")}>{plan.cta}</TrackedLink>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10 space-y-3 text-center">
          <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
            All prices in USD · No hidden agent or processing fees
          </p>
          <p className="mx-auto max-w-xl text-xs leading-relaxed text-lp-muted">
            Elora Visa supports your preparation but does not guarantee a visa decision.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
