"use client"

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
    <section className="relative py-20 md:py-28 bg-background">
      <div className="container px-4 mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Transparent answers about how Elora Visa works.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger className="text-base md:text-lg font-semibold">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {faq.a}
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
