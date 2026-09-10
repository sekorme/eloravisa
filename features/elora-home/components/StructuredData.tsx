import { BRAND } from "../data/content"
import { getPricingPlans } from "../adapters/pricing"
import { SITE_URL } from "../seo"

/**
 * JSON-LD structured data.
 *
 * Three graphs, each describing something a visitor can actually see on this
 * page or verify about the business:
 *
 *   Organization      who Elora is, and the legal disclaimer as its description
 *   SoftwareApplication  what the product is, with real pricing from the
 *                     billing config rather than invented figures
 *   WebSite           canonical identity for the domain
 *
 * DELIBERATELY ABSENT: `AggregateRating` and `Review`. Rich-result rating stars
 * are the single most tempting piece of schema to fake, Google's guidelines
 * require them to reflect genuine collected reviews, and this product has no
 * verified review source (see `../adapters/proof.ts`). Marking up ratings that
 * don't exist risks a manual action *and* misleads searchers before they even
 * reach the page.
 *
 * FAQPage schema is likewise absent: the guidelines require the marked-up Q&A
 * to be visible on the page, and this homepage has no FAQ section. If one is
 * added, mark it up then — not before.
 */
export function StructuredData() {
    const plans = getPricingPlans()
    const paid = plans.filter((p) => p.priceUsd > 0)

    const organization = {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: BRAND.name,
        url: SITE_URL,
        logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}${BRAND.logoSrc}`,
        },
        description:
            "Elora Visa provides AI-powered visa preparation and informational support. It is not a government body, law firm or licensed immigration adviser, does not issue visas or submit applications, and does not guarantee approval.",
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: `${SITE_URL}/contact`,
        },
    }

    const application = {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: BRAND.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        description:
            "Visa preparation workspace with AI document review, personalised checklists, statement-of-purpose drafting, voice mock interviews and application readiness scoring.",
        featureList: [
            "AI visa document review",
            "Personalised document checklists",
            "AI statement-of-purpose drafting",
            "Voice-powered mock visa interviews",
            "Destination preparation guidance",
            "Application readiness scoring",
            "Secure applicant workspace",
            "Application progress tracking",
        ],
        // Prices read from the live billing config, so this can't go stale.
        offers: [
            {
                "@type": "Offer",
                name: "Free tier",
                price: "0",
                priceCurrency: "USD",
            },
            ...paid.map((p) => ({
                "@type": "Offer",
                name: p.name,
                price: String(p.priceUsd),
                priceCurrency: "USD",
                // Stated because checkout settles in a different currency.
                description: `Listed in USD; charged in GHS via Paystack at the prevailing rate. Includes ${p.tokens} tokens per month.`,
            })),
        ],
    }

    const website = {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND.name,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
    }

    const graph = {
        "@context": "https://schema.org",
        "@graph": [organization, application, website],
    }

    return (
        <script
            type="application/ld+json"
            // Serialised from an object literal built entirely from our own
            // constants — no user input reaches this string.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
    )
}
