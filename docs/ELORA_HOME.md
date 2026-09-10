# Elora Home — the marketing homepage

The homepage lives entirely in `features/elora-home/`. `app/page.tsx` is a thin
shell that renders it. Nothing in this feature imports a legacy landing
component, and nothing outside it depends on this feature.

```
app/page.tsx                     route shell + ISR (revalidate 3600)
features/elora-home/
  EloraHome.tsx                  composes the scenes, fetches verified data
  seo.ts                         title, description, OG/Twitter, canonical
  styles/elora-home.css          THE DESIGN TOKENS — start here to restyle
  types/index.ts                 content shapes
  data/                          all copy and domain data (edit words here)
  adapters/                      the only bridges to the rest of the app
  motion/                        tokens, hooks, the animation gate
  components/                    primitives (Passport, Horizon, Ring, Cta…)
  SiteChrome.tsx                 nav + footer shared with the marketing pages
  scenes/                        the thirteen sections, in narrative order
```

## 0. One chrome for the whole public site

`SiteChrome.tsx` supplies the navigation bar, the footer, the skip link, the
`<main>` landmark, the animation gate and the reveal orchestrator. Both entry
points use it:

- the homepage, via `EloraHome`;
- every other public page, via `components/landing/MarketingPageShell`.

Before this the site had two headers and two footers depending on which page you
landed on — different logo lockups, different link sets, and a legal disclaimer
that only appeared on some of them. There is now exactly one place to change a
nav link or a footer column.

`SiteChrome` takes a `navTone` prop. While the bar is transparent it inherits
whatever it sits over: the homepage hero is white (`"light"`, the default), the
marketing hero is a navy-green band (`"dark"`). Without it the nav's dark-green
links are invisible on the marketing pages. The tone applies to the transparent
state only — once the bar condenses to white it reverts on its own.

---

## 1. Editing content

**All words live in `data/content.ts`.** Scenes never contain literal copy.
Domain data (documents, destinations, roadmap stages, tools, interview
questions) sits in its own file under `data/`.

`data/content.ts` opens with five editing rules. They are product-safety rules,
not style preferences. In short:

1. Never promise an outcome. No "guaranteed", no "100% approval", no
   "boost your chances by X%".
2. Never type a statistic into `data/`. Real numbers come from
   `adapters/proof.ts`, which reads Firestore.
3. Never state a processing time, fee or legal requirement for a country.
4. Never imply the AI replaces an embassy, a lawyer or a licensed adviser.
5. Every `href` must exist in `adapters/routes.ts`, which is checked against
   `app/`.

### Adding a destination

Append to `data/destinations.ts`. Give it real `lat`/`lon` — the globe markers
and flight arcs are projected from them. List **preparation areas**, never legal
requirements. It appears in the selector, the SVG globe and the 3D globe with no
other change.

### "Who is this for" (`data/audiences.ts`)

Four applicant situations, each with a photograph from `public/`. The wording is
the client's, kept close to verbatim — but three phrases were changed because
they promised things the product cannot deliver. The originals are quoted in the
file's header comment alongside the reason for each edit, so reverting is a
deliberate act rather than an accident:

1. "…to your final approval" → "…to the day you submit". The roadmap ends at
   submission; approval is the embassy's decision.
2. "Turning setbacks into success." → "…into a stronger application."
3. "We specialize in analyzing refusal letters to identify exactly what went
   wrong." → rewritten. There is no refusal-letter analyser in this product, and
   a refusal letter rarely states a specific fault.

### Adding a tool to the constellation

Append to `data/tools.ts` with `x`/`y` as percentages of the canvas and `feeds`
naming the tools it informs. The connecting lines are generated from `feeds`, so
the diagram cannot drift out of sync with what it claims.

---

## 2. The three honesty gates

These are the parts most likely to be "fixed" by someone who does not know why
they are the way they are.

| What | Where | Current state |
|---|---|---|
| Activity metrics | `adapters/proof.ts` → `getVerifiedMetrics()` | Live Firestore counts, hidden below `MIN_DISPLAYABLE` (25) |
| Testimonials | `adapters/proof.ts` → `getTestimonials()` | Returns `[]` — no consented source exists |
| Live class schedule | `adapters/proof.ts` → `getUpcomingClasses()` | Returns `[]` — no scheduling backend exists |

Each function documents exactly what to build to switch it on. The scenes
already render the "on" state — `LiveClasses` shows a real schedule the moment
`getUpcomingClasses()` returns rows, and `Voices` renders testimonials the moment
they exist. Neither is a TODO.

**The testimonial placeholder is development-only** (`NODE_ENV !== "production"`)
and cannot ship.

`MIN_DISPLAYABLE` is a *display* threshold: it decides whether to make a claim
at all. It must never be turned into a floor that substitutes a bigger number.

---

## 3. Replacing the visual assets

Almost every graphic is drawn in code, so there are few files to swap.

### The passport (`components/Passport.tsx`)

Inline SVG. Deliberately an **unbranded** travel document: no country, no crest,
no machine-readable zone, no visa sticker. Its realism comes from material
treatment — grained cover stock, foil specular sweep, cut page edges, spine
stitching.

> Do not replace this with a photograph of a real passport, and do not add a
> national crest or a realistic visa vignette. A convincing visa sticker
> rendered on a public web page can be cropped out and passed off as genuine.

To restyle, edit the gradients at the top of the file: `cover`, `foil`, `pages`,
`spec`.

### The documents (`data/documents.ts` + `scenes/DocumentIntelligence.tsx`)

Body text renders as **redacted rules**, never legible words, so nothing can be
mistaken for a real person's financial or passport data. `meta` strings are
obviously generic (`REF ****`). Keep both properties if you edit them.

### The globe

Two layers:

- `components/Horizon.tsx` — server-rendered SVG. **This is the design.** It is
  in the first HTML response, so the hero is complete before any JS runs.
- `components/GlobeCanvas.tsx` — the Three.js enhancement, loaded only through
  `components/GlobeLayer.tsx`.

`GlobeLayer` will not load 3D unless *all* of: viewport ≥ 1024px, no
`prefers-reduced-motion`, ≥ 4 CPU cores where reported, the browser is idle, and
the container is on screen. It unmounts when scrolled away. If any check fails
the SVG simply remains. Widen or narrow the gate there, in one place.

### The logo

`public/eloravisa.PNG`, referenced via `BRAND.logoSrc`. The artwork sits on a
white field, so `BrandLogo` sets it in a light chip rather than floating it on
the navy — that reads as a deliberate lockup instead of an untrimmed asset. If
you produce a transparent-background or monochrome-knockout version, drop the
chip styling in `components/Primitives.tsx`.

### Photography

Five images from `public/` carry the narrative arc, declared in `data/media.ts`:

| Image | Scene | Beat |
|---|---|---|
| `elora1.jpeg` | Hero backdrop | Preparing — a student working in a library |
| `elora2.jpeg` | Live classes | Learning alongside others |
| `akyere.jpg` | Destinations | Arriving |
| `elora3.jpeg` | Final scene | Settling in |
| `elora4.jpeg` | Final scene | Living it |

**Only images that have actually been looked at appear in `data/media.ts`.**
`public/` holds around twenty; the rest are unused because you cannot write
honest alt text for a file you have not opened, and a wrong description is worse
for a screen-reader user than no image at all. To add one: open it, write real
alt text, add an entry.

These are **editorial** images. None is attached to a testimonial, a named
person, or a claim about an outcome. Captions describe the moment, never a
result — a photograph of a London street is captioned "Arriving", not as
evidence of an approved application. Keep it that way.

### The hero backdrop and video

`components/HeroMedia.tsx`. The **still is the floor**: a `next/image` with
`priority`, always rendered, and the page's LCP element. The **video is the
ceiling**: it fades in over the still only once it is genuinely playing, so a
refused autoplay, an unsupported codec or a slow connection simply leaves the
photograph in place with nothing to notice.

The video is skipped entirely under `prefers-reduced-motion`, below 900px, and
when the browser reports `saveData` or a 2G connection.

> ⚠️ `herovideo.mp4` was never viewed frame by frame — no ffmpeg was available
> in the environment this page was built in. It is enabled because it was asked
> for, and it is safe to ship because the poster is the verified still. **Watch
> it once**, and if it doesn't suit, set `HERO_MEDIA.kind` to `"image"` in
> `data/media.ts` — one field, no other change.

Two LCP rules that are easy to undo by accident:

1. **The backdrop is not in the animation gate's hidden list.** An element at
   `opacity: 0` is not "contentful", so hiding it until JS runs would push LCP
   out by the length of hydration. Its entrance animates **transform only**.
2. **Do not pass `fetchPriority` to that `<Image>` by hand.** Doing so forwards
   the prop to the `<img>` and suppresses the `<link rel="preload" as="image">`
   that `priority` would otherwise inject. `priority` alone is correct.

---

## 4. The design token system

Everything visual is a token in `styles/elora-home.css`, scoped to
`[data-elora-home]` and prefixed `--eh-`. **Restyle by editing tokens, not
scenes.**

The page is **white**, built on three families: **navy green** (structure,
headings, dark surfaces), **light green** (tints, surfaces, verified states) and
**gold** (accent, attention, flourish).

Covered: colour ramps (`--eh-ng-*`, `--eh-green-*`, `--eh-gold-*`, `--eh-paper-*`),
typography and a fluid type scale, spacing, radii, shadows, blur, motion
durations, easing curves, and z-index layers.

Colour meanings are load-bearing and should be preserved:

| Token | Means |
|---|---|
| `--eh-verified` (green-600) | Verified / complete. Never decorative. |
| `--eh-guide` (gold-600) | Human guidance, "needs your attention". |
| `--eh-accent` (green-600) | The intelligence / AI signal. |
| `--eh-ng-*` | Structure, headings, and the two dark scenes. |
| `--eh-paper-*` | Anything that should read as a physical document. |

### The rest of the site

`app/globals.css` carries the same palette as the app-wide theme, so the
marketing pages (about, how-it-works, pricing, resources, ai-tools,
visa-guidance) and every shadcn component match the homepage rather than the
previous magenta/blue theme. Three token families were remapped there:

- the shadcn semantics (`--primary`, `--ring`, `--accent`, `--chart-*`,
  `--sidebar-*`) — these also reach the dashboard, which is intended;
- `--lp-*`, which the `components/landing/*` marketing components are built on;
- `--landing-*`, the fixed brand accents.

Both `:root` and `.dark` were converted, so the marketing pages are on-palette
in either theme. The homepage itself is deliberately exempt: `[data-elora-home]`
defines its own tokens and stays a fixed white brand surface regardless of the
theme toggle.

Around 35 hardcoded Tailwind colour utilities in those components (`blue-600`,
`cyan-300`, `violet-*`) were remapped to `emerald-*`, with the two progress-line
gradients going green → gold. `rose-*` was deliberately left alone — it marks
genuine error and negative-comparison states.

### Two golds, and why

`--eh-gold-400` (`#D4AF37`) is the true metallic and measures **2.1:1 on
white** — it is for FILLS ONLY and must never carry text on a light surface.
`--eh-gold-600` (`#8A6D0E`) is the darkened version used whenever gold has to
be *read*. Reaching for the pretty one as a text colour is the easiest way to
break this page's accessibility.

### Light and dark in one stylesheet

Text, lines and fills only ever use *surface-relative* tokens — `--eh-fg`,
`--eh-fg-muted`, `--eh-fg-subtle`, `--eh-line`, `--eh-surface*`, `--eh-panel*`.
The `.eh-dark` class redefines that whole set, so applying it to a section flips
every card, border, chip and body style beneath it with no duplicated rules.

Two scenes use it: the **interview booth** and the **footer**. Adding a third is
one class name.

> Never hardcode `rgb(255 255 255 / …)` for a border or surface. It will look
> right in one mode and disappear in the other.

Contrast is measured, not eyeballed. Every foreground token clears 4.5:1
against every surface it can land on — including `--eh-fg-subtle`, which was
darkened from `#6B8077` to `#556B61` after measuring 3.95:1 on the green tint.

Two font families are wired in `app/layout.tsx`: **Fraunces** (display,
variable, optical-size axis) and **Inter** (UI). Geist Mono carries the
departure-board lettering. Swap them there; the tokens pick them up.

---

## 5. The motion architecture

One tool per element, never two:

| Tool | Owns |
|---|---|
| GSAP + ScrollTrigger | scroll-linked timelines, entrance reveals |
| Motion for React | presence and interaction (the mobile drawer) |
| CSS | hover, focus, ambient texture, all stage morphs |
| Three.js / R3F | the hero globe, and nothing else |

### The animation gate — read this before touching entrances

Entrance animations need elements to start hidden. Doing that with `opacity: 0`
in CSS or a Motion `initial` prop puts the hidden state in the **server HTML**,
so a visitor whose JS fails, is slow, or is blocked sees a blank page.

Instead, `motion/AnimationGate.tsx` runs a tiny script during HTML parse (before
first paint, so there is no flash) that stamps `data-eh-anim="ready"` on
`<html>`. Only then does the CSS apply the hidden start state:

```css
html[data-eh-anim="ready"] [data-elora-home] .eh-reveal { opacity: 0; … }
```

The script refuses to run under `prefers-reduced-motion`. So:

- JS on, motion OK → hidden start state, animated reveal
- JS off / failed / slow → **content visible**
- reduced motion → **content visible**

**Never hardcode `opacity: 0` on content.** Add the hidden state behind the gate
selector, as the hero and final scenes do.

### Revealing is global — and must stay that way

`motion/RevealOrchestrator.tsx` finds every `.eh-reveal` / `.eh-reveal-x` /
`.eh-reveal-pop` element and every masked headline line on the page, and wires
them up once with `ScrollTrigger.batch`. A scene cannot forget to opt in.

This replaced a per-scene `<Reveal>` wrapper, and the reason matters. Hiding was
global (CSS, behind the gate) while revealing was **opt-in per scene**. Eight of
the fourteen scenes had no wrapper, so their section titles and body copy were
hidden by the stylesheet and never animated back — invisible on the live page.

> If you ever move revealing back into individual components, you reintroduce
> that bug class. Hiding and showing must live in the same place.

`components/Reveal.tsx` still exists as a dumb layout container so existing call
sites keep working; it ships no JavaScript and animates nothing.

The orchestrator also carries a safety net: if anything already scrolled into
view is still at `opacity: 0` after four seconds, it removes the
`data-eh-anim` attribute from `<html>`, which un-hides the entire page in one
step. GSAP failing should never mean a blank homepage.

### Reduced motion

Handled in three layers: the gate never fires; a global rule collapses all
durations; and scenes that *depend* on scroll to reveal information render a
static equivalent instead. `Journey` is the clearest case — its sticky scene is
replaced wholesale by `.eh-journey-static`, a plain ordered list of all four
stages, because a scroll-driven scene that cannot scroll would otherwise show
stage 1 forever.

### Pinning

`Journey` uses `position: sticky`, **not** ScrollTrigger's `pin`. Sticky needs no
spacer, cannot shift layout on resize, keeps the scrollbar honest, and never
traps the visitor. ScrollTrigger is used only to report progress.

---

## 6. Analytics

Scenes never touch `window.gtag` or import `lib/analytics` directly. They call
`track(event, ctx)` from `adapters/analytics.ts`, which maps a homepage intent
onto the provider's event vocabulary. Switching provider is a change to
`dispatch()` alone.

Tracked: hero primary/secondary, sample interview, destination selection,
destination guide, class waitlist, plan selection, final CTA, sign-in, tool
focus, nav CTA.

**Never pass applicant input.** Labels are slugs this codebase controls. The
waitlist and subscribe forms deliberately send a fixed slug, never the email.

---

## 7. Accessibility invariants

Things that will break if changed carelessly:

- **One `<h1>`**, in the hero. Sections use `<h2>`, subsections `<h3>`.
- **Status is never colour alone.** Every readiness state, document flag,
  interview state and roadmap stage prints its status as text beside the colour.
- **The globe markers are decorative.** Orthographic projection hides the far
  side of the sphere, so Australia has no marker at all. The real control is the
  `.eh-global-tabs` button group, which always lists every destination. Do not
  make markers the only control.
- **The mobile drawer is a real modal**: focus trapped, Escape closes, scroll
  locked, focus returned to the trigger.
- **The constellation and its mobile list** are swapped with `display: none`, so
  exactly one is in the accessibility tree at a time. Don't switch that to
  `visibility` or opacity.
- **44px minimum touch targets**, enforced in CSS on buttons, nav links and
  globe markers (which carry an invisible 44px hit area around a 14px dot).

---

## 8. The microphone rule

`scenes/InterviewScene.tsx` **never calls `getUserMedia`**, and there is no code
path through it that can. The waveform is synthesised from a deterministic
function of bar index. The real session at `/dashboard/ai-mock-interview` asks
for the microphone, once, when the applicant starts it.

A marketing page that triggers a permission prompt while someone is still
deciding whether to trust the product spends trust it has not yet earned. The
visible notice under the demo says all of this in plain language. Keep both the
behaviour and the notice.

---

## 9. Performance notes

- The page is **prerendered** with `revalidate = 3600` (metrics would otherwise
  freeze at build time).
- Three.js is never in the first-load bundle — see §3.
- `Trust` and `Voices` are Server Components and ship no JavaScript.
- Every absolutely-positioned composition sits in a fixed `aspect-ratio` box, so
  CLS is zero by construction.
- The hero uses `100svh`, not `100vh` — `vh` is the *largest* viewport on mobile,
  which cuts off the hero on load and reflows when the URL bar hides.
- No large blurred layer is continuously animated. The aurora is a static
  gradient; the only looping animations are transform-only and small.
- `overflow-x: clip` sits on `.eh-main`, not the root, because `clip` would also
  clip the fixed navigation. `clip` rather than `hidden` so `position: sticky`
  keeps working.
