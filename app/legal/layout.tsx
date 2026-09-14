import React from "react";
import { SiteChrome } from "@/features/elora-home/SiteChrome";

/**
 * Layout for the legal pages (privacy, terms, cookies, disclaimer).
 *
 * The navigation bar and footer come from `SiteChrome`, the same chrome the
 * homepage and the marketing pages use. `SiteChrome` also supplies the
 * `<main>` landmark, the skip link and the animation gate, so none of that is
 * repeated here.
 *
 * Each page renders `LegalDocument` (features/legal), which owns the page
 * layout — including the top padding that clears the fixed navigation.
 *
 * `navTone` is left at its default "light": the legal header is a pale green
 * tint, so the navigation's dark-green links are the readable choice while
 * the bar is still transparent.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
