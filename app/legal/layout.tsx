import React from "react";
import { SiteChrome } from "@/features/elora-home/SiteChrome";

/**
 * Layout for the legal pages (privacy, terms, cookies, disclaimer).
 *
 * The navigation bar and footer come from `SiteChrome`, the same chrome the
 * homepage and the marketing pages use. This file previously pulled in the
 * older `LandingNavbar` and landing `Footer`, which made the legal pages the
 * last corner of the site with a different header, a different logo lockup and
 * a different link set.
 *
 * Two things `SiteChrome` already provides, so they are deliberately NOT
 * repeated here:
 *
 *   - the `<main>` landmark. Nesting a second `<main>` inside it would be
 *     invalid and would give assistive tech two competing main regions, so the
 *     page container below is a plain `<div>`.
 *   - the skip link and the animation gate.
 *
 * `navTone` is left at its default "light": legal pages open on a white
 * surface, so the navigation's dark-green links are the readable choice while
 * the bar is still transparent.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome>
      {/* Top padding clears the fixed navigation, which is ~84px tall before
          it condenses. */}
      <div className="container mx-auto max-w-4xl px-4 pb-24 pt-32 md:pt-40">
        {children}
      </div>
    </SiteChrome>
  );
}
