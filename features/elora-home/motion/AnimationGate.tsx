/**
 * The animation gate.
 *
 * ------------------------------------------------------------------------
 * THE PROBLEM THIS SOLVES
 * ------------------------------------------------------------------------
 * Entrance animations need elements to start hidden. The naive way to do that
 * is `opacity: 0` in CSS, or a Motion `initial` prop — but both are rendered
 * into the server HTML, so if JavaScript fails, is still loading, is blocked by
 * an extension, or the device is on a slow connection, the visitor is left
 * staring at an blank page. On a marketing homepage that is a total failure;
 * for an applicant on a mid-range phone in Accra on a patchy connection, it's
 * the *likely* case, not the edge case.
 *
 * ------------------------------------------------------------------------
 * THE FIX
 * ------------------------------------------------------------------------
 * The server always renders content **visible**. This tiny script runs
 * synchronously during HTML parse — before first paint, so there is no flash —
 * and stamps `data-eh-anim="ready"` on <html>. Only *then* does the CSS in
 * `elora-home.css` apply the hidden start state:
 *
 *     html[data-eh-anim="ready"] .eh-reveal { opacity: 0; ... }
 *
 * So the guarantee is:
 *   - JS on, motion allowed   → hidden start state, animated reveal.
 *   - JS off / failed / slow  → attribute never set, everything visible.
 *   - prefers-reduced-motion  → attribute never set, everything visible,
 *                               and scenes fall back to short opacity fades.
 *
 * The reduced-motion check lives *inside* the gate rather than in each scene,
 * so a reduced-motion visitor can never end up with hidden content waiting on
 * an animation that was suppressed.
 */

// Kept as a single expression with no external references so it can be inlined
// verbatim. `try/catch` because `matchMedia` is absent in some embedded webviews.
const GATE_SCRIPT = `
try {
  var m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!m || !m.matches) {
    document.documentElement.setAttribute('data-eh-anim', 'ready');
  }
} catch (e) {}
`.trim()

/**
 * Renders the gate. Must appear once, as early in the page body as possible —
 * before any `.eh-reveal` element, so the hidden state is in force by the time
 * those elements are parsed.
 */
export function AnimationGate() {
    return (
        <script
            // Static, self-contained string with no interpolation of any kind.
            // There is no user-controlled value anywhere in this component.
            dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }}
        />
    )
}
