// Shared motion utilities and constants
// Keep values subtle and consistent across the site.

export const MOTION = {
  revealEase: "power3.out",
  idleEase: "sine.inOut",
  revealDur: 0.6,
  stagger: 0.08,
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
