import Link from "next/link"
import Image from "next/image"
import { Send } from "lucide-react"
import { FOOTER_ATTRIBUTION, FOOTER_COLUMNS, FOOTER_DISCLAIMER } from "@/lib/landing/content"
import { FooterSubscribe } from "./FooterSubscribe"
import { Reveal } from "./ui"

/**
 * §21 Footer. Link groups come from `lib/landing/content.ts` — add links there,
 * not here, and only for routes that actually exist.
 *
 * Telegram is the only social channel with a real, verified URL, so it's the
 * only one listed. Adding empty Facebook/Instagram/X icons would send visitors
 * nowhere.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-lp-line bg-lp-page">
      <div className="container relative mx-auto px-4 pb-10 pt-16 md:px-6 md:pt-24">
        <Reveal>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-8">
            {/* Brand + subscribe */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-2">
              <Link href="/" className="group mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lp-card p-2 lp-shadow transition-transform group-hover:scale-105">
                  <Image
                    src="/eloravisa.PNG"
                    alt="Elora Visa logo"
                    width={32}
                    height={32}
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-lp-fg">
                  Elora Visa
                </span>
              </Link>
              <p className="mb-7 max-w-sm text-sm leading-relaxed text-lp-muted">
                An intelligent companion for preparing a stronger, better-organized visa application, with clear
                guidance, AI preparation tools, and no agent fees.
              </p>

              <div className="mb-7 max-w-sm">
                <FooterSubscribe />
              </div>

              <Link
                href="https://t.me/+wWazCHK2wEMzMzdk"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-lp-line bg-lp-card px-4 text-sm font-semibold text-lp-fg transition-all hover:-translate-y-0.5 hover:border-lp-azure/40 lp-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
              >
                <Send className="h-4 w-4 text-lp-azure" aria-hidden="true" />
                Join us on Telegram
              </Link>
            </div>

            {/* Link columns */}
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="mb-5 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-lp-fg">
                  {column.heading}
                </h2>
                <ul className="space-y-3 text-sm text-lp-muted">
                  {column.links.map((link) => (
                    <li key={`${column.heading}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="rounded-sm transition-colors hover:text-lp-azure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </Reveal>

        {/* Contact */}
        <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-lp-line pt-8 text-sm">
          <span className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lp-muted">Email us</span>
            <a
              href="mailto:info@eloravisa.com"
              className="rounded-sm font-medium text-lp-fg transition-colors hover:text-lp-azure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
            >
              info@eloravisa.com
            </a>
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-lp-muted">Call us</span>
            <a
              href="tel:+233553143196"
              className="rounded-sm font-medium text-lp-fg transition-colors hover:text-lp-azure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
            >
              +233 55 314 3196
            </a>
          </span>
        </div>

        {/* Independence disclaimer — required, and deliberately not hidden in
            small print behind a toggle. */}
        <div className="mt-10 rounded-2xl border border-lp-line bg-lp-card/60 p-5">
          <p className="text-xs leading-relaxed text-lp-muted">{FOOTER_DISCLAIMER}</p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-lp-line pt-8 text-xs text-lp-muted md:flex-row">
          <p className="font-medium">© {new Date().getFullYear()} Elora Visa. All rights reserved.</p>
          <p className="font-medium tracking-wide text-lp-muted/70">{FOOTER_ATTRIBUTION}</p>
        </div>
      </div>

      {/* Ghost wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[4vw] flex select-none justify-center overflow-hidden whitespace-nowrap font-display text-[18vw] font-light uppercase leading-none tracking-[0.14em] lp-outline-text md:text-[13vw]"
      >
        ELORA VISA
      </div>
    </footer>
  )
}
