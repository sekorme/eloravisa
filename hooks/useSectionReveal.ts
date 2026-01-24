"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { MOTION, prefersReducedMotion } from "@/lib/motion";

/**
 * useSectionReveal
 * Standardized section entrance animation (fade + y) with ScrollTrigger.
 * - Apply to a section container and mark children with [data-reveal].
 * - Respects prefers-reduced-motion.
 */
export function useSectionReveal(selector: string = "[data-reveal]") {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    if (prefersReducedMotion()) {
      const items = Array.from(el.querySelectorAll<HTMLElement>(selector));

      items.forEach((i) => {
        i.style.opacity = "1";
        i.style.transform = "none";
      });

      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const items = Array.from(el.querySelectorAll<HTMLElement>(selector));
    const ctx = gsap.context(() => {
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 18 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: MOTION.revealDur,
        ease: MOTION.revealEase,
        stagger: MOTION.stagger,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [selector]);

  return ref;
}
