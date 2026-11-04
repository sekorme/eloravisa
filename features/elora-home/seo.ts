import type { Metadata } from "next"

/**
 * SEO for the homepage.
 *
 * Copy rules apply here exactly as they do in `data/content.ts` — arguably more
 * so, because a search snippet is read by people who have not yet seen any of
 * the page's caveats. No approval claims, no success rates, no "boost your
 * chances". The description says what the product does.
 */

export const SITE_URL = "https://www.eloravisa.com"

/* Share image: app/opengraph-image.tsx (1200×630, used by Open Graph and X). */

const TITLE = "Elora Visa | Prepare smarter. Apply with confidence."

const DESCRIPTION =
    "An AI-powered visa preparation workspace: personalised document checklists, AI document review, statement-of-purpose drafting, voice mock interviews and application readiness insight for UK, Canada, US, Germany, Ireland and Australia routes."

export const homeMetadata: Metadata = {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    keywords: [
        "visa preparation",
        "visa document review",
        "mock visa interview",
        "statement of purpose",
        "student visa preparation",
        "visa readiness",
        "visa interview practice",
    ],
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        siteName: "Elora Visa",
        locale: "en",
        url: SITE_URL,
        title: TITLE,
        description: DESCRIPTION,
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
}
