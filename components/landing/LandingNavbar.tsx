"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Compass, Menu, Moon, Sun, ArrowUpRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { NAVIGATION } from "@/lib/landing/navigation"
import { trackEvent } from "@/lib/analytics"

export function LandingNavbar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState("")
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { user } = useAuth()
  const pathname = usePathname()
  const reduced = useReducedMotion()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    const observer = new IntersectionObserver((entries) => { for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id) }, { rootMargin: "-20% 0px -55% 0px" })
    NAVIGATION.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element) })
    return () => { window.removeEventListener("scroll", onScroll); observer.disconnect() }
  }, [pathname])
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)")
    const close = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener("change", close)
    return () => desktop.removeEventListener("change", close)
  }, [])
  const href = (id: string) => pathname === "/" ? `#${id}` : `/#${id}`
  const dark = tone === "dark"
  const cta = user ? "/dashboard" : "/signup"
  return (
    <header className="landing-nav fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:z-50 focus:rounded-lg focus:bg-lp-card focus:px-4 focus:py-3 focus:text-lp-fg">Skip to content</a>
      <div className={cn("mx-auto flex max-w-[1360px] items-center justify-between gap-2 rounded-full border px-3 transition-[height,background-color,box-shadow] duration-300 sm:px-5", scrolled ? "h-16 shadow-lg shadow-slate-950/5 backdrop-blur-xl" : "h-[72px]", dark ? "border-white/15 bg-lp-navy/90 text-white" : scrolled ? "border-lp-line bg-lp-card/95 text-lp-fg" : "border-lp-line bg-lp-card/65 text-lp-fg backdrop-blur-md")}>
        <Link href="/" aria-label="Elora Visa home" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl font-display text-base font-bold tracking-tight sm:text-lg"><span className="flex size-9 items-center justify-center rounded-xl bg-lp-azure text-white"><Compass className="size-5" aria-hidden="true" /></span><span>Elora<span className="font-medium opacity-65"> Visa</span></span></Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
          {NAVIGATION.map((item) => <Link key={item.id} href={href(item.id)} aria-current={active === item.id ? "location" : undefined} className={cn("relative flex min-h-11 items-center rounded-full px-3 text-xs font-medium transition-colors", dark ? "hover:bg-white/10" : "hover:bg-lp-azure/5")}>
            {active === item.id && <motion.span layoutId="nav-active" transition={{ duration: reduced ? 0 : .25 }} className={cn("absolute inset-0 rounded-full", dark ? "bg-white/10" : "bg-lp-azure/10")} />}
            <span className="relative">{item.label}</span>
          </Link>)}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle color theme" className="relative hidden size-11 items-center justify-center rounded-full hover:bg-lp-azure/10 sm:flex"><Sun className="size-4 dark:hidden" aria-hidden="true" /><Moon className="hidden size-4 dark:block" aria-hidden="true" /></button>
          {!user && <Link href="/login" className="hidden min-h-11 items-center rounded-full px-3 text-sm font-medium sm:inline-flex">Sign In</Link>}
          <Link href={cta} onClick={() => trackEvent("section_cta_click", { location: "navigation", label: user ? "dashboard" : "signup" })} className="inline-flex min-h-11 items-center justify-center rounded-full bg-lp-azure px-3 text-xs font-semibold text-white transition-colors hover:bg-lp-azure-2 sm:px-5 sm:text-sm">{user ? "Dashboard" : "Start for Free"}</Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><button type="button" aria-label="Open navigation" className="inline-flex size-11 items-center justify-center rounded-full xl:hidden"><Menu className="size-5" aria-hidden="true" /></button></SheetTrigger>
            <SheetContent side="right" className="inset-0 h-dvh w-full max-w-none border-0 bg-lp-page p-6 text-lp-fg sm:max-w-none [&>button]:size-11 [&>button]:rounded-full [&>button]:text-lp-fg">
              <SheetTitle className="pt-3 font-display text-xl text-lp-fg">Explore Elora Visa</SheetTitle>
              <SheetDescription className="text-lp-muted">A clearer path to your next chapter.</SheetDescription>
              <nav aria-label="Mobile navigation" className="mt-6 flex-1 overflow-y-auto">
                {NAVIGATION.map((item, i) => <motion.div key={item.id} initial={false} animate={{ x: 0 }} transition={{ delay: reduced ? 0 : i * .04 }}><SheetClose asChild><Link href={href(item.id)} className="flex min-h-16 items-center justify-between border-b border-lp-line text-lg font-medium"><span>{item.label}</span><ArrowUpRight className="size-4 text-lp-azure" aria-hidden="true" /></Link></SheetClose></motion.div>)}
              </nav>
              <div className="flex flex-col gap-3 pb-4">
                <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-lp-line text-sm"><Sun className="size-4" aria-hidden="true" />Toggle color theme</button>
                {!user && <SheetClose asChild><Link href="/login" className="flex min-h-12 items-center justify-center rounded-full border border-lp-line font-semibold">Sign In</Link></SheetClose>}
                <SheetClose asChild><Link href={cta} className="flex min-h-14 items-center justify-center rounded-full bg-lp-azure font-semibold text-white">{user ? "Open dashboard" : "Start for Free"}<ArrowUpRight className="ml-2 size-4" aria-hidden="true" /></Link></SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <noscript><nav aria-label="Navigation without scripts" className="mx-auto mt-2 flex max-w-4xl flex-wrap justify-center gap-4 rounded-2xl bg-lp-card p-3 text-xs text-lp-fg">{NAVIGATION.map((item) => <a key={item.id} href={href(item.id)}>{item.label}</a>)}</nav></noscript>
    </header>
  )
}
