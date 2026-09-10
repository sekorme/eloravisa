import type { ReactNode } from "react"
import { SiteChrome } from "@/features/elora-home/SiteChrome"
import { FinalCTASection } from "./FinalCTASection"

interface MarketingPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

/**
 * The shell every public marketing page renders inside.
 *
 * The navigation bar and footer come from `SiteChrome`, which is the same
 * chrome the homepage uses. Previously this file pulled in `LandingNavbar` and
 * the landing `Footer`, so the site had two different headers and two different
 * footers depending on which page you landed on — including a legal disclaimer
 * that only appeared on some of them.
 *
 * `SiteChrome` also supplies the `<main>` landmark, the skip link and the
 * animation gate, so none of that is repeated here.
 */
export function MarketingPageShell({ eyebrow, title, description, children }: MarketingPageShellProps) {
  return (
    // `navTone="dark"`: these pages open on a navy-green hero band, so the
    // transparent nav needs light links until it condenses.
    <SiteChrome navTone="dark">
      <header className="relative isolate overflow-hidden bg-landing-navy px-4 pb-20 pt-36 text-white md:px-6 md:pb-28 md:pt-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_25%,var(--color-landing-violet),transparent_32%)] opacity-25" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-landing-navy/50 to-black/40" aria-hidden="true" />
        <div className="container mx-auto max-w-5xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-landing-cyan">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">{description}</p>
        </div>
      </header>
      {children}
      <FinalCTASection />
    </SiteChrome>
  )
}
