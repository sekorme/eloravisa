import { FAQS } from "./content"

/**
 * JSON-LD builders for the homepage (§26).
 *
 * The FAQ schema is generated from the same `FAQS` array the accordion
 * renders, which is what Google requires: structured data must match visible
 * content. Do not add entries here that a visitor cannot read on the page.
 */

const SITE = "https://eloravisa.com"

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Elora Visa",
    url: SITE,
    logo: `${SITE}/eloravisa.PNG`,
    description:
      "Elora Visa is an independent, AI-powered visa preparation platform that helps applicants build document checklists, review their documents, practise visa interviews and track application readiness.",
    email: "info@eloravisa.com",
    telephone: "+233553143196",
    sameAs: ["https://t.me/+wWazCHK2wEMzMzdk"],
  }
}

/**
 * SoftwareApplication describes the product itself. `offers` states only that
 * a free tier exists — it deliberately carries no aggregateRating, because we
 * have no verified review corpus to back one up and a fabricated rating is
 * both dishonest and a structured-data violation.
 */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elora Visa",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE,
    description:
      "AI visa preparation tools: personalized document checklists, AI document review, statement of purpose drafting, voice mock interviews and application readiness tracking.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan with a monthly AI credit allowance. Paid plans available.",
    },
  }
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }
}
