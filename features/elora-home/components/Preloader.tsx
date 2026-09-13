import { BRAND } from "../data/content"

/**
 * The brand curtain.
 *
 * ------------------------------------------------------------------------
 * WHAT THIS IS
 * ------------------------------------------------------------------------
 * A full-screen intro modelled on the parent company's site
 * (souhaithub.com), rebuilt in Elora's palette. The choreography there was
 * measured in a browser rather than guessed at, and is reproduced beat for beat:
 *
 *   1. the wordmark's letters rise out of an overflow mask, staggered;
 *   2. a hairline accent rule scales out from the centre;
 *   3. the tagline fades in over the tail of the rule;
 *   4. a short hold;
 *   5. the whole curtain slides UP off the top of the screen on an
 *      accelerating ease, revealing the page.
 *
 * ------------------------------------------------------------------------
 * IT IS RENDERED ON THE SERVER, AND ANIMATES IN PURE CSS
 * ------------------------------------------------------------------------
 * The markup ships in the first HTML response and the whole sequence is CSS
 * keyframes. That matters for two reasons:
 *
 *   - No flash of the page followed by a curtain dropping over it. The curtain
 *     is simply the first thing painted.
 *   - If JavaScript is slow, blocked or broken, the animation still completes
 *     and still gets out of the way. A preloader that depends on JS to leave is
 *     a preloader that can permanently hide your site.
 *
 * `pointer-events: none` from the very first frame, so it never intercepts a
 * click even while visible, and `aria-hidden` so it is invisible to assistive
 * tech — the real page underneath is already in the DOM and readable.
 *
 * ------------------------------------------------------------------------
 * WHO DOESN'T SEE IT
 * ------------------------------------------------------------------------
 * The inline script below stamps `data-eh-curtain="skip"` on <html> — before
 * first paint, so there is no flicker — when `prefers-reduced-motion` is set.
 * That guard is not optional: a full-screen animated curtain is exactly what
 * the setting exists to suppress.
 *
 * `ONCE_PER_SESSION` can additionally limit it to one play per browser session.
 * It is off, so the curtain plays on every load including refreshes, matching
 * the parent site.
 */

/**
 * Plays on every page load, matching the parent site.
 *
 * Set to `true` to show it only once per browser session instead. That was the
 * original default, but `sessionStorage` survives a refresh — so reloading the
 * page skipped the curtain, which read as it being broken.
 */
const ONCE_PER_SESSION = false

const GATE = `
try {
  var skip = false;
  var m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (m && m.matches) skip = true;
  ${ONCE_PER_SESSION ? `
  if (!skip) {
    try {
      if (sessionStorage.getItem('eh-curtain') === 'seen') skip = true;
      else sessionStorage.setItem('eh-curtain', 'seen');
    } catch (e) {}
  }` : ""}
  if (skip) document.documentElement.setAttribute('data-eh-curtain', 'skip');
} catch (e) {
  document.documentElement.setAttribute('data-eh-curtain', 'skip');
}
`.trim()

export function Preloader() {
    // Split for the per-letter reveal. A space becomes a fixed-width gap rather
    // than an animated span, so the stagger doesn't pause mid-wordmark.
    const letters = BRAND.name.toUpperCase().split("")

    return (
        <>
            {/* Must precede the markup so the skip attribute is set before the
                curtain is parsed. Static string, no interpolated input. */}
            <script dangerouslySetInnerHTML={{ __html: GATE }} />

            <div className="eh-curtain" aria-hidden="true">
                <span className="eh-curtain-grid eh-coordgrid" />

                <div className="eh-curtain-inner">
                    <div className="eh-curtain-word">
                        {letters.map((ch, i) =>
                            ch === " " ? (
                                <span className="eh-curtain-space" key={i} />
                            ) : (
                                <span
                                    className="eh-curtain-letter"
                                    key={i}
                                    // The stagger index drives the per-letter
                                    // delay in CSS, so no JS is involved.
                                    style={{ ["--eh-i" as string]: i }}
                                >
                                    {ch}
                                </span>
                            )
                        )}
                    </div>

                    <span className="eh-curtain-rule" />
                    <span className="eh-curtain-tagline">{BRAND.promise}</span>
                </div>
            </div>
        </>
    )
}
