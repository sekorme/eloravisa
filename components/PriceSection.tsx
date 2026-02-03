"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import { title, subtitle } from "./primitives";

import { useSectionReveal } from "@/hooks/useSectionReveal";

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
  },
];

export default function PriceSection() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useSectionReveal();

  useEffect(() => {
    const root = gridRef.current;

    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-price-card]"),
    );
    const badges = Array.from(
      root.querySelectorAll<HTMLElement>("[data-badge]"),
    );

    if (prefersReduced) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1, clearProps: "transform" });

      return;
    }

    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.set(cards, { opacity: 0, y: 18, scale: 0.98 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "transform",
      });

      // Subtle floating idle animation for all cards
      gsap.to(cards, {
        y: (i) => (i % 2 === 0 ? -3 : -5),
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.12, yoyo: true },
      });

      // Highlighted card gets a gentle glow pulse and a slightly larger float
      const highlighted = cards.filter((el) => el.dataset.highlight === "true");

      if (highlighted.length) {
        // slightly larger float for highlight
        gsap.to(highlighted, {
          y: -7,
          duration: 3.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        // animate the dedicated glow layer instead of expensive box-shadow
        const highlightGlows = highlighted
          .map((el) => el.querySelector<HTMLElement>("[data-glow]"))
          .filter((n): n is HTMLElement => Boolean(n));

        if (highlightGlows.length) {
          gsap.set(highlightGlows, { opacity: 0.4, scale: 1 });
          gsap.to(highlightGlows, {
            opacity: 0.8,
            scale: 1.03,
            duration: 1.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            transformOrigin: "50% 50%",
          });
        }
      }

      // Badge breathing animation
      if (badges.length) {
        gsap.to(badges, {
          scale: 1.04,
          duration: 1.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          transformOrigin: "50% 50%",
        });
      }
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={revealRef as any} className="py-8 md:py-15">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10 md:mb-14">
          <h2 data-reveal className={title({ size: "lg", color: "blue" })}>
            Pricing
          </h2>
          <p data-reveal className={subtitle({ fullWidth: true })}>
            Choose a plan that fits your journey. Start free, upgrade when
            you&apos;re ready.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              data-price-card
              className={[
                "relative rounded-2xl border bg-content1/50 p-6 shadow-sm backdrop-blur",
                "border-default-200",
                plan.highlight
                  ? "ring-1 ring-blue-500/30 border-blue-300/50 bg-background/70"
                  : "",
              ].join(" ")}
              data-highlight={plan.highlight ? "true" : "false"}
            >
              {plan.highlight && (
                <div
                  aria-hidden
                  data-glow
                  className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-blue-500/25 blur-2xl opacity-40"
                />
              )}
              {plan.badge && (
                <span
                  data-badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-default-200 bg-background px-3 py-1 text-xs font-medium text-default-700 shadow-sm"
                >
                  {plan.badge}
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-default-600">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.cadence ? (
                    <span className="pb-1 text-default-500">
                      {plan.cadence}
                    </span>
                  ) : null}
                </div>
              </div>

              <ul className="mb-6 space-y-2 text-sm text-default-700">
                {plan.features.map((f) => (
                  <li key={f.name} className={`flex items-start gap-2 ${!f.included ? "text-default-400" : ""}`}>
                    {f.included ? (
                      <svg
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 text-default-400"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    )}
                    <span className={!f.included ? "line-through decoration-default-400/50" : ""}>{f.name}</span>
                  </li>
                ))}
              </ul>

              <div>
                <button
                  aria-label={plan.cta + " for " + plan.name}
                  className={[
                    "w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                      : "border border-default-200 bg-background text-foreground hover:bg-content2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-default-300",
                  ].join(" ")}
                >
                  {plan.cta}
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-default-500">
          Prices in USD. You can cancel or change your plan anytime.
        </p>
      </div>
    </section>
  );
}
