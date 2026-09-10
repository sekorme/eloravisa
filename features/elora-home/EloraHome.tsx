import { SiteChrome } from "./SiteChrome"
import { StructuredData } from "./components/StructuredData"
import { getTestimonials, getUpcomingClasses, getVerifiedMetrics } from "./adapters/proof"

import { Hero } from "./scenes/Hero"
import { Journey } from "./scenes/Journey"
import { Audiences } from "./scenes/Audiences"
import { DocumentIntelligence } from "./scenes/DocumentIntelligence"
import { InterviewScene } from "./scenes/InterviewScene"
import { Roadmap } from "./scenes/Roadmap"
import { GlobalGuidance } from "./scenes/GlobalGuidance"
import { LiveClasses } from "./scenes/LiveClasses"
import { Ecosystem } from "./scenes/Ecosystem"
import { Trust } from "./scenes/Trust"
import { Voices } from "./scenes/Voices"
import { Pricing } from "./scenes/Pricing"
import { FinalCta } from "./scenes/FinalCta"

/**
 * The Elora homepage.
 *
 * ------------------------------------------------------------------------
 * ARCHITECTURE
 * ------------------------------------------------------------------------
 * A Server Component. It fetches the page's verified data once, on the server,
 * and passes it down — so nothing on this page waterfalls a client-side request
 * to render, and the whole document is meaningful in the first HTML response.
 *
 * Scenes declare `"use client"` only where they genuinely need it (scroll
 * timelines, form state, pointer interaction). `Trust` and `Voices` ship no
 * JavaScript at all.
 *
 * ------------------------------------------------------------------------
 * THE NARRATIVE
 * ------------------------------------------------------------------------
 * Scene order is the argument, and it is deliberately emotional in shape:
 * establish → destabilise → resolve → reassure → ask.
 *
 *    1 Hero        Here is what this is, and what to do about it.
 *    2 Journey     Anxiety becomes an ordered plan. (The spine.)
 *    3 Audiences   "...and yes, that means you." Four real situations.
 *    4 Documents   Here is the hard part — what can go wrong in your file.
 *    4 Interview   And the part people fear most. You can rehearse it.
 *    5 Roadmap     Calm after the storm: it is a finite, ordered list.
 *    6 Destinations Made specific to where *you* are going.
 *    7 Classes     Humans, not only software.
 *    8 Ecosystem   How the pieces reinforce each other.
 *    9 Trust       You are handing over sensitive documents. Here's the deal.
 *   10 Voices      Only what can be verified.
 *   11 Pricing     What it costs, stated plainly.
 *   12 Final       Arrival. The scattered pieces become one portfolio.
 *
 * ------------------------------------------------------------------------
 * DATA HONESTY
 * ------------------------------------------------------------------------
 * `getVerifiedMetrics`, `getTestimonials` and `getUpcomingClasses` return only
 * what genuinely exists; two of them currently return empty, and the scenes
 * handle that as a designed state rather than a gap. See `adapters/proof.ts`.
 */
export async function EloraHome() {
    // Fetched in parallel: three independent reads shouldn't serialise.
    const [metrics, testimonials, classes] = await Promise.all([
        getVerifiedMetrics(),
        getTestimonials(),
        getUpcomingClasses(),
    ])

    return (
        <SiteChrome>
            <StructuredData />

            <Hero />
            <Journey />
            <Audiences />
            <DocumentIntelligence />
            <InterviewScene />
            <Roadmap />
            <GlobalGuidance />
            <LiveClasses classes={classes} />
            <Ecosystem />
            <Trust />
            <Voices testimonials={testimonials} metrics={metrics} />
            <Pricing />
            <FinalCta />
        </SiteChrome>
    )
}
