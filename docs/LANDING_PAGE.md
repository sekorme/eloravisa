# Homepage guide

Everything about the marketing homepage at `/`: where the content lives, how to
change it, and which animations can be switched off independently.

---

## 1. Where things live

```
app/page.tsx                        route + page-level SEO metadata
app/layout.tsx                      fonts, gtag config, theme + auth providers
app/globals.css                     design tokens (--lp-*) and landing utilities

lib/landing/content.ts              ← ALL homepage copy and lists
lib/landing/schema.ts               JSON-LD (Organization, SoftwareApplication, FAQ)
lib/analytics.ts                    typed trackEvent() / trackSignupConversion()
lib/publicStats.ts                  verified aggregate counts from Firestore
lib/subscriptions.ts                the single source of truth for pricing

action/emailLists.ts                server actions for the two email lists

components/landing/
  LandingPage.tsx                   section composition (the page's running order)
  ui.tsx                            shared primitives: Reveal, Display, PillLink, TabCard…
  StructuredData.tsx                emits the JSON-LD
  HeroSection.tsx                   §7 hero
  GlobeJourney.tsx                  owns the one shared globe and flies it down the page
  VisaGlobeCanvas.tsx               the R3F globe (dynamically imported, never SSR'd)
  HeroGlobeFallback.tsx             static SVG globe: mobile / reduced-motion / no WebGL
  DestinationRibbon.tsx             §8
  ProblemSolutionSection.tsx        §9
  HowItWorksSection.tsx             §10
  AIToolsBento.tsx + AIToolCard     §11  (+ DocumentReviewDemo, MockInterviewDemo, ChecklistDemo)
  MockInterviewSpotlight.tsx        §12
  DocumentReadinessDemo.tsx         §13
  JourneySelector / TargetAudienceSection   §14
  LiveClassesSection.tsx            §15
  TrustMetrics / Testimonial        §16
  TrustSection.tsx                  §17
  FAQAccordion.tsx                  §19
  FinalCTASection.tsx               §20
  Footer.tsx + FooterSubscribe.tsx  §21
components/PriceSection.tsx         §18
```

**Rule of thumb:** copy changes go in `lib/landing/content.ts`, not in the
components. Section order changes go in `LandingPage.tsx`.

---

## 2. Editing content

### Text, destinations, FAQs, footer links

All in `lib/landing/content.ts`, grouped and commented by brief section. Each
export is plain serialisable data, so it can later be swapped for a CMS fetch
without touching a component.

Three constraints are deliberate — please keep them:

1. **No statistics or testimonials in this file.** Verified counts come from
   `lib/publicStats.ts`; testimonials live in `Testimonial.tsx` and must be real
   and approved.
2. **No approval promises.** Elora helps applicants prepare; it does not decide
   or influence outcomes, and the copy must never suggest otherwise.
3. **Every `href` must resolve.** A footer link to a page that doesn't exist is
   worse than no link.

### The FAQ is also the structured data

`FAQS` in `content.ts` feeds both the visible accordion and the `FAQPage`
JSON-LD in `lib/landing/schema.ts`. That's intentional — Google requires
structured data to match visible content. **Do not** add a Q&A to one and not
the other, and keep the answers plain text (no markup).

Exactly one answer is expanded by default, via `defaultValue="item-0"` on the
`<Accordion>` in `FAQAccordion.tsx`.

---

## 3. Replacing images

Hero and section imagery is served from `/public`. To swap one:

1. Drop the new file in `public/` (prefer `.webp` or `.avif`; keep the longest
   edge ≤ 1600px for section imagery).
2. Update the path where it's referenced — `JourneySelector.tsx` (`image:`),
   `Testimonial.tsx` (`src:`), `ui.tsx` (`AvatarStack`'s `faces`), or
   `Footer.tsx` / `LandingNavbar.tsx` for the logo.
3. **Always update the `alt` text with it.** Decorative images use `alt=""`;
   anything meaningful needs a real description.

Use `next/image` for anything above the fold so it gets sized and optimised.
`AvatarStack` uses a plain `<img>` deliberately — three 28px avatars aren't worth
the optimiser round-trip.

Remote images must have their hostname allow-listed in
`next.config.ts → images.remotePatterns`.

---

## 4. Updating pricing

Prices, token allowances and plan features come from **`lib/subscriptions.ts`**
only. `components/PriceSection.tsx` derives everything it shows from that file
(including "up to N document reviews", computed from `TOKEN_COSTS`), so:

- To change a price or allowance → edit `SUBSCRIPTION_PLANS` in
  `lib/subscriptions.ts`. The homepage, the pricing page and billing all follow.
- To change a plan's *card* wording (description, CTA label, badge) → edit the
  `plans` array in `PriceSection.tsx`.
- **Never hard-code a price in a component.** It will drift from what's billed.

The "Elora Visa supports your preparation but does not guarantee a visa
decision." line under the cards is required. Please leave it.

---

## 5. Statistics and testimonials (§16)

`getPublicStats()` returns aggregate Firestore counts and **omits any metric it
can't read** rather than returning zero. Every consumer must therefore handle
`undefined` by rendering nothing — see `TrustMetrics.tsx` and the applicant pill
in `HeroSection.tsx`. Do not add a fallback number.

Note: `/` is statically prerendered, so these counts are baked in at build time
and refresh on redeploy. If you need them live, add
`export const revalidate = 3600` to `app/page.tsx`.

Testimonials in `Testimonial.tsx` must be real and approved, and must not claim
Elora caused a visa approval.

---

## 6. Turning animations off

Animation is deliberately compartmentalised so any one piece can be disabled
without touching the others.

| What | Where | To disable |
|---|---|---|
| Global reduced-motion | `app/globals.css` (`@media (prefers-reduced-motion)`) | Already automatic — every component also checks it in JS |
| Smooth scrolling (Lenis) | `components/LenisProvider.tsx` | Remove `<LenisProvider>` from `app/layout.tsx` |
| Hero entrance + parallax | `HeroSection.tsx` `useLayoutEffect` | Delete the `gsap.timeline()` block; markup renders fully without it |
| Hero scanning light | `HeroSection.tsx` `.hero-scan` tween | Remove the `gsap.fromTo(".hero-scan", …)` call |
| Hero readiness ring draw | `HeroSection.tsx` `.hero-ring` | Drop the `motion-safe:[animation:lp-draw…]` class |
| 3D globe entirely | `GlobeJourney.tsx` | Render `<HeroGlobeFallback />` instead of `<VisaGlobeCanvas />` |
| Globe fly-down-the-page | `GlobeJourney.tsx` | Remove the `gsap.fromTo` ScrollTrigger; the globe then stays in the hero slot |
| Destination ribbon scroll | `DestinationRibbon.tsx` / `.lp-marquee-track` | Set `--marquee-duration: 0s`, or bump the animation out of the CSS class |
| Problem→solution morph | `ProblemSolutionSection.tsx` | Replace `useInView` with `const solved = true` |
| Interview demo loop | `MockInterviewSpotlight.tsx` | Set `phase` to `"feedback"` and skip the effects — that's exactly what reduced-motion does |
| Section reveals | `components/landing/ui.tsx` | Make `Reveal`/`RevealGroup` return their children directly |
| Card tilt | `hooks/useTilt.ts` | Return the ref before attaching listeners |

Two conventions worth keeping:

- **One library per property.** GSAP owns scroll-linked work (hero timeline,
  globe flight, connector lines); Motion owns component state transitions and
  reveals; CSS owns ambient loops. Never animate the same property with two.
- **Nothing runs off-screen.** `MockInterviewSpotlight` gates its timers on
  `useInView`; ScrollTrigger only fires in range. If you add a loop, gate it.

---

## 7. Analytics

Use `trackEvent()` from `lib/analytics.ts` — never call `gtag()` inline. Event
names are a closed union, so a typo is a build error instead of a junk metric.

Currently wired:

| Event | Fired from |
|---|---|
| `hero_mock_interview_click` | `HeroSection.tsx` |
| `tool_card_interaction` | `AIToolCard.tsx` |
| `pricing_plan_select` | `PriceSection.tsx` |
| `live_class_reservation` | `LiveClassesSection.tsx` |
| `faq_engagement` | `FAQAccordion.tsx` |
| `account_creation_started` / `_completed` | `components/auth/SignupSheet.tsx` |

`hero_cta_primary_click` and `section_cta_click` are defined and available; the
hero's primary CTA currently reports through `account_creation_started`, since
the button opens the signup sheet directly.

**Never** pass visa answers, document names, free text or email addresses to
`trackEvent`. The `EventParams` type only allows a coarse `label`, `location`
and numeric `value` for that reason.

`trackSignupConversion()` reports the Google Ads conversion, and fires **once**,
from `SignupSheet` after an account genuinely exists. It used to fire from an
inline snippet in `app/layout.tsx` on every page load, which reported every
visitor as a conversion. Please don't move it back there.

---

## 8. Things intentionally left incomplete

Three items from the brief are not fully built, each for a stated reason.

### Live classes have no backend (§15)

The brief specifies a bookable upcoming-class card with an instructor, date, seat
count and live video preview. **None of that data exists** — there is no classes
route, schedule, or model anywhere in the app. Rather than ship an invented
listing with a dead "Reserve My Seat" button, `LiveClassesSection.tsx` states
that classes are launching soon and offers a waitlist that genuinely records the
address to the `class_waitlist` Firestore collection.

When real class data lands:

1. Add the schedule model and a `/classes` route.
2. In `LiveClassesSection.tsx`, replace the "Classes launching soon" badge and
   the `TOPICS` / `COMMON_QUESTIONS` cards with the real upcoming-class card, and
   swap the waitlist form for a "Reserve My Seat" action.
3. Point the `Live Classes` nav item (`LandingNavbar.tsx → NAV_SECTIONS`) and the
   footer link at `/classes` instead of `/#live-classes`.
4. Email everyone in `class_waitlist`.

### Two legal pages don't exist yet

The brief asks for `AI Usage Policy` and `Data Deletion Instructions` links.
Only `privacy-policy`, `terms-of-service`, `cookie-policy` and `disclaimer` exist
under `app/legal/`, so those are the only ones linked — a footer link to a 404 is
worse than its absence. Once the two pages are written, add them to
`FOOTER_COLUMNS` in `content.ts` and to `LEGAL_LINKS` in `TrustSection.tsx`.

The FAQ answer on deleting data currently points people at
`info@eloravisa.com`, which is accurate today. Update it if a self-serve deletion
flow ships.

### Lighthouse targets are unverified

The brief sets Lighthouse ≥ 90/95/95/95 and LCP < 2.5s. The implementation
follows the practices that get there — server-rendered hero, dynamically
imported 3D, transform/opacity-only animation, capped device pixel ratio, no
animated blur on large surfaces, no scroll-jacking — but **no Lighthouse run has
been done**. Measure against a production build on a real deployment before
treating those numbers as met.

---

## 9. One change outside the homepage

`context/AuthContext.tsx` used to render a full-screen spinner in place of
`children` until Firebase auth resolved in the browser — on *every* route. That
meant the homepage's server-rendered HTML was a loading spinner: the hero could
never be the LCP element, the page was blank with JS disabled, and crawlers saw a
loading state instead of content.

The spinner is now shown only on routes that actually render account-specific
data (`/dashboard`, `/onboarding`, `/affiliate/dashboard`). Public pages render
immediately and re-render if a signed-in user turns up.

Trade-off: a signed-in visitor landing on `/` may briefly see the homepage before
being redirected to their dashboard. That was judged clearly better than every
first-time visitor seeing a spinner as their first paint.
