"use client"

/**
 * A short confetti burst for real achievements (a journey milestone, an
 * approved visa). Loaded on demand, skipped for people who prefer reduced
 * motion, in the app's greens.
 */
export async function celebrate() {
  if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  const confetti = (await import("canvas-confetti")).default
  const colors = ["#2E7D5B", "#8FCDAF", "#F5C76B", "#ffffff"]
  confetti({ particleCount: 90, spread: 70, origin: { y: 0.65 }, colors, disableForReducedMotion: true })
  setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 }, colors, disableForReducedMotion: true }), 250)
}
