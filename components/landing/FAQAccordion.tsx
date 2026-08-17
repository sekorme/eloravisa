"use client"

import Link from "next/link"
import { ArrowUpRight, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { SUBSCRIPTION_PLANS, TOKEN_COSTS } from "@/lib/subscriptions"

const telegramPlans = Object.values(SUBSCRIPTION_PLANS)
  .filter((p) => "hasTelegram" in p && p.hasTelegram)
  .map((p) => p.name)
  .join(" and ")

const FAQS = [
  {
    q: "Is Elora Visa a travel agency?",
    a: "No. Elora Visa is a self-help educational and AI-powered visa preparation platform. We are not a travel agency, law firm, immigration consultancy, embassy or government institution.",
  },
  {
    q: "Does Elora Visa apply for the visa on my behalf?",
    a: "No. You remain in control of your application from start to finish. Elora Visa gives you checklists, AI document feedback, mock interviews and guidance — you submit your own application to the relevant authority.",
  },
  {
    q: "Can Elora Visa guarantee visa approval?",
    a: "No. Visa decisions are made solely by the appropriate immigration authorities. We do not, and cannot, guarantee approval. Our tools are designed to help you prepare the strongest, clearest application you can.",
  },
  {
    q: "How does AI document review work?",
    a: `You upload a document from your dashboard, and our AI reviews it for missing information, inconsistencies and areas that may need clearer explanation. A document review costs ${TOKEN_COSTS.DOCUMENT_REVIEW} tokens.`,
  },
  {
    q: "How does the AI mock interview work?",
    a: `You take a realistic, voice-based mock interview with Elora AI and receive structured feedback on clarity, completeness and confidence. A mock interview session costs ${TOKEN_COSTS.MOCK_INTERVIEW} tokens.`,
  },
  {
    q: "What are AI tokens?",
    a: "Tokens are the currency used to access AI-powered tools like document review and mock interviews. Every plan includes a monthly token allowance, and you can see exactly what each action costs from your dashboard before you use it.",
  },
  {
    q: "Is my information secure?",
    a: "We use secure Firebase authentication, encrypted (HTTPS/TLS) data transmission, and account-scoped document access so your data isn't visible to other applicants. See our Privacy Policy for full details.",
  },
  {
    q: "Can I use Elora Visa after a refusal?",
    a: "Yes. Elora Visa can help you understand common reasons for refusal, identify gaps in your evidence, and prepare a stronger, more complete reapplication.",
  },
  {
    q: "Which destinations and visa categories are supported?",
    a: "Elora Visa's guidance and checklists are built to adapt to a wide range of destinations and visa categories, including study, work and visitor visas. Visit the Visa Guidance page to explore what's currently covered.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Yes. You can upgrade at any time from your dashboard, and your new token allowance and features apply immediately.",
  },
  {
    q: "How do I join the Telegram community?",
    a: telegramPlans
      ? `Telegram community access is included with the ${telegramPlans}. Once subscribed, you'll find the invite link in your dashboard.`
      : "Telegram community access is included with select plans. Once subscribed, you'll find the invite link in your dashboard.",
  },
  {
    q: "Can AI-generated content be submitted without editing?",
    a: "No. AI-generated statements, SOPs and suggestions are a starting point only. Always review, edit and personalize any AI-generated content so it accurately reflects your real circumstances before submitting it anywhere.",
  },
]

export function FAQAccordion() {
  return (
    <section id="faq" className="relative isolate overflow-hidden bg-slate-50 py-20 dark:bg-slate-950 md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,var(--color-landing-cyan),transparent_26%)] opacity-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_88%_82%,var(--color-landing-violet),transparent_24%)] opacity-10" aria-hidden="true" />

      <div className="container mx-auto grid gap-12 px-4 md:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-landing-cyan/25 bg-landing-cyan/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-landing-blue dark:text-landing-cyan">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Clear answers
          </div>
          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Questions are part of good preparation.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Straightforward answers about Elora Visa, AI tools, pricing and the responsibility you keep throughout your application.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/contact"
              className="group flex min-h-20 items-center gap-4 rounded-2xl border border-border bg-background/80 p-4 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue dark:focus-visible:ring-landing-cyan"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-landing-blue/10 text-landing-blue dark:bg-landing-cyan/10 dark:text-landing-cyan">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Still need help?</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Contact the Elora Visa team</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>

            <div className="flex min-h-20 items-center gap-4 rounded-2xl border border-border bg-background/80 p-4 shadow-sm backdrop-blur-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-landing-violet/10 text-landing-violet">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">Transparent by design</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">No approval guarantees or hidden claims</span>
              </span>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="item-0" className="flex w-full flex-col gap-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`item-${i}`}
              className="overflow-hidden rounded-2xl border border-border bg-background/85 px-5 shadow-sm backdrop-blur-md transition-all data-[state=open]:border-landing-blue/30 data-[state=open]:shadow-lg dark:data-[state=open]:border-landing-cyan/30 sm:px-6"
            >
              <AccordionTrigger className="gap-4 py-5 text-base font-bold hover:no-underline focus-visible:ring-2 focus-visible:ring-landing-blue data-[state=open]:text-landing-blue dark:focus-visible:ring-landing-cyan dark:data-[state=open]:text-landing-cyan md:text-lg [&>svg]:h-5 [&>svg]:w-5 [&>svg]:rounded-full [&>svg]:bg-muted [&>svg]:p-1">
                <span className="flex min-w-0 items-start gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{faq.q}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pl-11 pr-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                <div className="flex gap-3 rounded-2xl bg-muted/55 p-4 sm:p-5">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-landing-blue dark:text-landing-cyan" aria-hidden="true" />
                  <p>{faq.a}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }),
        }}
      />
    </section>
  )
}
