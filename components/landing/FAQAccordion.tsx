"use client"

import Link from "next/link"
import { ArrowUpRight, HelpCircle, MessageCircle, ShieldCheck } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { FAQS } from "@/lib/landing/content"
import { trackEvent } from "@/lib/analytics"
import { Display, Eyebrow, Reveal } from "./ui"

export function FAQAccordion() {
  return (
    <section id="faq" className="relative scroll-mt-20 bg-lp-page py-16 md:py-24" aria-labelledby="faq-heading">
      <div className="container mx-auto grid gap-12 px-4 md:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow>Clear answers</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <Display as="h2" size="lg" className="mt-5 max-w-xl text-lp-fg">
              <span id="faq-heading">Questions are part of good preparation.</span>
            </Display>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-lp-muted md:text-base">
              Straightforward answers about Elora Visa, AI tools, pricing and the responsibility you keep throughout
              your application.
            </p>
          </Reveal>

          <Reveal delay={0.24} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/contact"
              className="group flex min-h-20 items-center gap-4 rounded-2xl border border-lp-line bg-lp-card p-4 lp-shadow transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lp-navy text-white">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-lp-fg">Still need help?</span>
                <span className="mt-0.5 block text-xs text-lp-muted">Contact the Elora Visa team</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-lp-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>

            <div className="flex min-h-20 items-center gap-4 rounded-2xl border border-lp-line bg-lp-card p-4 lp-shadow">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lp-azure/10 text-lp-azure">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold text-lp-fg">Transparent by design</span>
                <span className="mt-0.5 block text-xs text-lp-muted">No approval guarantees or hidden claims</span>
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal amount={0.05} y={40}>
          <Accordion
            type="single"
            collapsible
            // §19 exactly one answer expanded by default.
            defaultValue="item-0"
            onValueChange={(value) => {
              // Empty string means the open item was collapsed — only the open
              // action is worth recording, and only the question index, never
              // anything the visitor typed.
              if (value) trackEvent("faq_engagement", { location: "faq", label: value })
            }}
            className="flex w-full flex-col gap-3"
          >
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-lp-line bg-lp-card px-5 shadow-sm transition-all data-[state=open]:border-lp-azure/40 data-[state=open]:lp-shadow sm:px-6"
              >
                <AccordionTrigger className="gap-4 py-5 text-left text-base font-bold text-lp-fg hover:no-underline focus-visible:ring-2 focus-visible:ring-lp-azure data-[state=open]:text-lp-azure md:text-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:rounded-full [&>svg]:bg-lp-sky-2 [&>svg]:p-1 [&>svg]:text-lp-fg">
                  <span className="flex min-w-0 items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lp-sky-2 font-display text-[10px] font-semibold tabular-nums text-lp-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-11 pr-2 text-sm leading-relaxed text-lp-muted md:text-base">
                  <div className="flex gap-3 rounded-2xl bg-lp-card-2 p-4 sm:p-5">
                    <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-lp-azure" aria-hidden="true" />
                    <p>{faq.a}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>

    </section>
  )
}
