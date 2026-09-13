/**
 * Homepage copy — the single place a non-developer edits words.
 *
 * ------------------------------------------------------------------------
 * EDITING RULES (these are product-safety rules, not style preferences)
 * ------------------------------------------------------------------------
 *  1. Never promise an outcome. Elora prepares applicants; it does not decide
 *     applications. No "guaranteed", no "100% approval", no "boost your
 *     chances by X%".
 *  2. Never add a statistic here. Verified counts come from
 *     `../adapters/proof.ts`, which reads Firestore and omits anything it
 *     cannot count. A number typed into this file is by definition unverified.
 *  3. Never state a processing time, fee or legal requirement for a specific
 *     country. Those change without notice and getting one wrong can cost an
 *     applicant a refusal.
 *  4. Never imply the AI replaces an embassy, a lawyer or a licensed adviser.
 *  5. Every `href` must resolve to a real route — add it to
 *     `../adapters/routes.ts`, which is checked against `app/`.
 */

import { ROUTES } from "../adapters/routes"

/* ------------------------------------------------------------------------ */
/*  Brand                                                                    */
/* ------------------------------------------------------------------------ */

export const BRAND = {
    name: "Elora Visa",
    /** The positioning line the whole page has to earn. */
    promise: "Prepare smarter. Apply with confidence.",
    logoSrc: "/eloravisa.PNG",
    logoAlt: "Elora Visa",
} as const

/* ------------------------------------------------------------------------ */
/*  Navigation                                                               */
/* ------------------------------------------------------------------------ */

export const NAV_LINKS = [
    { label: "How It Works", href: ROUTES.howItWorks },
    { label: "AI Tools", href: ROUTES.aiTools },
    { label: "Visa Classes", href: "#live-classes" },
    { label: "Pricing", href: ROUTES.pricing },
    { label: "Resources", href: ROUTES.resources },
    { label: "Affiliate", href: ROUTES.affiliate },
] as const

export const NAV_CTA = {
    signIn: { label: "Sign In", href: ROUTES.signIn },
    primary: { label: "Start Preparing", href: ROUTES.signUp },
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 1 — Hero                                                           */
/* ------------------------------------------------------------------------ */

export const HERO = {
    eyebrow: "AI-powered visa preparation",
    /** Rendered as separate masked lines, so the break is intentional. */
    headlineLines: ["Your visa journey,", "made brilliantly clear."],
    /** The fragment that carries the gradient. Must appear in a headline line. */
    headlineAccent: "brilliantly clear.",
    supporting:
        "Review your documents, practise your interview, build your application and know what to do next — with intelligent guidance tailored to your journey.",
    primaryCta: { label: "Check My Visa Readiness", href: ROUTES.signUp },
    secondaryCta: { label: "Explore How Elora Works", href: "#journey" },
    reassurance: "Start free · No credit card required",
    /** Labels on the hero composition. `82%` is explicitly framed as a sample. */
    sampleLabel: "Sample preparation workspace",
    readiness: { value: 82, label: "Application readiness" },
    signals: [
        { id: "passport", label: "Passport", state: "verified" },
        { id: "funds", label: "Proof of funds", state: "verified" },
        { id: "sop", label: "Statement of purpose", state: "attention" },
        { id: "itinerary", label: "Travel itinerary", state: "pending" },
    ],
    scrollCue: "Begin the journey",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 2 — Pinned transformation                                          */
/* ------------------------------------------------------------------------ */

export const JOURNEY = {
    eyebrow: "The journey to readiness",
    headline: "From application anxiety to a clear next step.",
    intro:
        "Most applicants start with a browser full of contradictory tabs. Elora turns that into one ordered plan you can actually work through.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 3 — Who is this for                                                */
/* ------------------------------------------------------------------------ */

export const AUDIENCE = {
    eyebrow: "Who is this for",
    body:
        "Elora is built for the person doing the work themselves. Wherever you are starting from, the preparation is the same shape — these are the four situations we see most.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 4 — Document intelligence                                          */
/* ------------------------------------------------------------------------ */

export const DOCUMENTS = {
    eyebrow: "Document intelligence",
    headline: "Your documents should tell one convincing story.",
    body:
        "A visa file is read as a whole. Elora reads it the same way — checking that your dates, finances, employment and intentions agree with each other before anyone else sees them.",
    outcomes: [
        {
            id: "missing",
            title: "Find missing information",
            body: "Spot the supporting document your file needs but doesn't have yet.",
        },
        {
            id: "inconsistent",
            title: "Detect inconsistencies",
            body: "Catch dates, names and amounts that disagree across documents.",
        },
        {
            id: "evidence",
            title: "Strengthen supporting evidence",
            body: "See where a claim is asserted but not yet evidenced.",
        },
        {
            id: "prioritised",
            title: "Get prioritised recommendations",
            body: "Work through what matters most first, not an undifferentiated list.",
        },
    ],
    /** Non-negotiable disclaimer, rendered visibly in the scene. */
    disclaimer:
        "Elora's review is preparation support. It is not legal advice, and it does not replace an embassy, consulate or licensed immigration adviser.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 4 — Interview                                                      */
/* ------------------------------------------------------------------------ */

export const INTERVIEW = {
    eyebrow: "Voice mock interviews",
    headline: "Walk into your interview already prepared.",
    body:
        "Practise out loud with an AI interviewer that asks follow-up questions, then read back what you actually said — structure, clarity and the gaps worth tightening.",
    micNotice:
        "The sample below runs entirely in your browser and never requests microphone access. A full voice session asks for your microphone first, and only when you start it.",
    sampleCta: "Try a Sample Question",
    fullCta: { label: "Open Mock Interview", href: ROUTES.mockInterview },
    stateLabels: {
        connecting: "Connecting",
        listening: "Listening",
        thinking: "Thinking",
        speaking: "Speaking",
    },
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 5 — Roadmap                                                        */
/* ------------------------------------------------------------------------ */

export const ROADMAP = {
    eyebrow: "Your personalised roadmap",
    headline: "Know exactly what comes next.",
    body:
        "Elora keeps one ordered view of your application: what's done, what's waiting on you, and what deserves your attention this week.",
    exampleNotice: "Example roadmap. Yours is built from your destination, visa type and timeline.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 6 — Global guidance                                                */
/* ------------------------------------------------------------------------ */

export const GLOBAL = {
    eyebrow: "Destination guidance",
    headline: "Guidance shaped around your destination.",
    body:
        "Preparation for a UK student route looks nothing like preparation for a US visitor interview. Select a destination to see what Elora focuses on.",
    guideCta: "View Destination Guide",
    disclaimer:
        "Preparation guidance only. Elora does not publish processing times, fees or eligibility rulings — always confirm requirements with the official embassy or consulate.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 7 — Live classes                                                   */
/* ------------------------------------------------------------------------ */

export const CLASSES = {
    eyebrow: "Expert-led live classes",
    headline: "Learn the process from people who have taught it.",
    body:
        "Live sessions covering document preparation, interview technique and destination-specific requirements — with time for your questions.",
    /** Shown while `getUpcomingClasses()` has no verified schedule. */
    waitlist: {
        title: "Classes are being scheduled",
        body: "We haven't published dates yet, so there's nothing here pretending to be a timetable. Leave your email and you'll hear the moment sessions are confirmed.",
        cta: "Notify Me",
        placeholder: "you@example.com",
    },
    scheduleCta: { label: "View Upcoming Classes", href: ROUTES.resources },
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 8 — Ecosystem                                                      */
/* ------------------------------------------------------------------------ */

export const ECOSYSTEM = {
    eyebrow: "One connected workspace",
    headline: "Every tool feeds the same readiness picture.",
    body:
        "Nothing here is a standalone gadget. What your document review finds changes your checklist, which changes your interview practice, which changes your readiness score.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 9 — Trust                                                          */
/* ------------------------------------------------------------------------ */

export const TRUST = {
    eyebrow: "Privacy and security",
    headline: "Your application deserves privacy.",
    body:
        "You are handing over passport details, bank statements and personal plans. Here is exactly how that is handled.",
    /**
     * Every claim below is one this product can actually stand behind based on
     * how the app is built (Firebase Auth-gated accounts, per-user document
     * scoping, account deletion). Nothing here asserts a certification —
     * no SOC 2, no ISO 27001, no GDPR "compliance" badge — because none has
     * been verified. Do not add one without an audit report to point at.
     */
    pillars: [
        {
            id: "account",
            title: "Secure account access",
            body: "Your workspace sits behind an authenticated account. Documents are scoped to you, not to a shared pool.",
        },
        {
            id: "handling",
            title: "Controlled document handling",
            body: "Documents you upload are used to generate your review and your guidance — not to advertise to you.",
        },
        {
            id: "control",
            title: "You control your data",
            body: "Delete individual documents, or close your account and remove your workspace, from your settings.",
        },
        {
            id: "limits",
            title: "Transparent AI limitations",
            body: "AI output is preparation support and can be wrong. Elora tells you what it checked, so you can verify it.",
        },
    ],
    links: [
        { label: "Privacy Policy", href: ROUTES.privacy },
        { label: "Terms of Service", href: ROUTES.terms },
        { label: "Cookie Policy", href: ROUTES.cookies },
        { label: "Disclaimer", href: ROUTES.disclaimer },
    ],
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 10 — Voices                                                        */
/* ------------------------------------------------------------------------ */

export const VOICES = {
    eyebrow: "Applicant voices",
    headline: "Real experiences, published only with consent.",
    body:
        "We don't run invented testimonials. When applicants agree to share their experience, it appears here with their name and their route.",
} as const

/* ------------------------------------------------------------------------ */
/*  Scene 11 — Pricing                                                       */
/* ------------------------------------------------------------------------ */

export const PRICING = {
    eyebrow: "Preparation plans",
    headline: "Start free. Upgrade when the work gets real.",
    body:
        "Every plan runs on tokens — one balance spent across document review, interview practice, drafting and readiness insight.",
    cta: "Choose Your Preparation Plan",
} as const

/* ------------------------------------------------------------------------ */
/*  Final scene                                                              */
/* ------------------------------------------------------------------------ */

export const FINAL = {
    eyebrow: "Departure",
    headline: "Your application deserves more than guesswork.",
    body:
        "Build your documents, practise your answers and move forward with a plan you understand.",
    primaryCta: { label: "Start Preparing for Free", href: ROUTES.signUp },
    secondaryCta: { label: "View Elora's AI Tools", href: ROUTES.aiTools },
} as const

/* ------------------------------------------------------------------------ */
/*  Footer                                                                   */
/* ------------------------------------------------------------------------ */

export const FOOTER = {
    tagline: "An intelligent preparation workspace for people applying for a visa.",
    /**
     * Parent-company attribution.
     *
     * The only OUTBOUND link on the homepage, so it is the one exception to the
     * "every href must exist in adapters/routes.ts" rule — that adapter maps
     * internal app routes, and this is a third-party site. It opens in a new
     * tab, which is announced to screen readers rather than left as a surprise.
     */
    attribution: {
        prefix: "Powered by",
        name: "Souhait Hub",
        href: "https://souhaithub.com",
    },
    subscribe: {
        title: "Occasional, useful updates",
        body: "New tools and preparation guides. No pressure, no spam.",
        placeholder: "you@example.com",
        cta: "Subscribe",
    },
    /**
     * Legally load-bearing. Do not soften, shorten or move this below the fold
     * of the footer.
     */
    disclaimer:
        "Elora Visa provides visa preparation and informational support only. We are not a government body, a law firm or a licensed immigration adviser. We do not issue visas, submit applications on your behalf, or guarantee that any application will be approved. Always confirm requirements with the official embassy, consulate or immigration authority for your destination.",
    columns: [
        {
            heading: "Product",
            links: [
                { label: "AI Tools", href: ROUTES.aiTools },
                { label: "How It Works", href: ROUTES.howItWorks },
                { label: "Pricing", href: ROUTES.pricing },
                { label: "Your Dashboard", href: ROUTES.dashboard },
            ],
        },
        {
            heading: "Visa tools",
            links: [
                { label: "Document Review", href: ROUTES.documentReview },
                { label: "Mock Interview", href: ROUTES.mockInterview },
                { label: "SOP Assistant", href: ROUTES.sopDraft },
                { label: "Readiness Insight", href: ROUTES.readiness },
            ],
        },
        {
            heading: "Learn",
            links: [
                { label: "Destination Guides", href: ROUTES.visaGuidance },
                { label: "Resources", href: ROUTES.resources },
                { label: "Live Classes", href: "#live-classes" },
                { label: "Applicant Stories", href: ROUTES.successStories },
            ],
        },
        {
            heading: "Company",
            links: [
                { label: "About", href: ROUTES.about },
                { label: "Contact", href: ROUTES.contact },
                { label: "Affiliate Programme", href: ROUTES.affiliate },
            ],
        },
        {
            heading: "Legal",
            links: [
                { label: "Privacy Policy", href: ROUTES.privacy },
                { label: "Terms of Service", href: ROUTES.terms },
                { label: "Cookie Policy", href: ROUTES.cookies },
                { label: "Disclaimer", href: ROUTES.disclaimer },
            ],
        },
    ],
} as const
