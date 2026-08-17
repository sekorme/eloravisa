"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, Menu, X, LayoutDashboard, LogOut, ArrowUpRight } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "motion/react"
import { signOut } from "firebase/auth"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ClientOnly } from "@/components/ClientOnly"
import { LoginModal } from "@/components/auth/LoginModal"
import { SignupSheet } from "@/components/auth/SignupSheet"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { prefersReducedMotion } from "@/lib/motion"

const NAV_SECTIONS = [
  { id: "how-it-works", label: "How It Works", href: "/how-it-works" },
  { id: "ai-tools", label: "AI Tools", href: "/ai-tools" },
  { id: "visa-guidance", label: "Visa Guidance", href: "/visa-guidance" },
  { id: "pricing", label: "Pricing", href: "/pricing" },
  { id: "success-stories", label: "Success Stories", href: "/success-stories" },
  { id: "resources", label: "Resources", href: "/resources" },
]

function AccountMenu({ user }: { user: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const initial = (user.displayName?.[0] ?? user.email?.[0] ?? "?").toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="rounded-full ring-offset-2 ring-offset-background transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-cyan"
        >
          <Avatar>
            <AvatarImage src={user.photoURL ?? undefined} alt="" />
            <AvatarFallback className="text-xs font-semibold">{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LandingNavbar() {
  const { setTheme } = useTheme()
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Lock body scroll while the mobile panel is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [mobileOpen])

  const panelTransition = prefersReducedMotion()
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 300, damping: 30 }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 transition-all duration-300 md:px-5",
        scrolled ? "pt-2" : "pt-4 md:pt-5"
      )}
    >
      <div
        className={cn(
          "group container relative isolate mx-auto flex h-16 items-center justify-between overflow-hidden rounded-3xl border border-white/20 bg-slate-950/80 px-3 text-white shadow-2xl backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 supports-[backdrop-filter:blur(1px)]:bg-slate-950/35 md:px-4",
          scrolled || mobileOpen
            ? "h-14 border-white/30 bg-slate-950/85 supports-[backdrop-filter:blur(1px)]:bg-slate-950/55"
            : "hover:border-white/30 hover:bg-slate-950/85 supports-[backdrop-filter:blur(1px)]:hover:bg-slate-950/40"
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/20 via-white/[0.03] to-landing-cyan/10"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-12 -top-16 -z-10 h-32 w-48 rounded-full bg-white/20 blur-3xl transition-transform duration-700 group-hover:translate-x-6"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-8 -z-10 h-32 w-48 rounded-full bg-landing-violet/20 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-px -z-10 rounded-3xl border border-white/10 shadow-inner"
        />

        <Link
          href="/"
          aria-label="Elora Visa home"
          className="relative z-10 flex min-h-11 items-center gap-2 rounded-xl pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-cyan"
        >
          <Image
            src="/eloravisa.PNG"
            alt=""
            width={48}
            height={48}
            priority
            className="h-11 w-11 object-contain"
          />
          <span className="hidden text-base font-bold tracking-tight sm:block">Elora Visa</span>
        </Link>

        <nav aria-label="Primary navigation" className="relative z-10 hidden items-center text-xs font-medium xl:flex 2xl:text-sm">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={section.href}
              className={cn(
                "relative rounded-full px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-cyan 2xl:px-4",
                activeSection === section.id
                  ? "bg-white/20 text-white shadow-inner backdrop-blur-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {section.label}
            </a>
          ))}
          <Link
            href="/affiliate"
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-cyan 2xl:px-4",
              "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            Affiliate
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </nav>

        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
          <ClientOnly>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ClientOnly>

          <div className="hidden items-center gap-1 sm:flex">
            <ClientOnly>
              {!loading && user ? (
                <AccountMenu user={user} />
              ) : !loading ? (
                <>
                  <div className="[&_button]:text-white [&_button:hover]:bg-white/10">
                    <LoginModal />
                  </div>
                  <SignupSheet
                    desscription="Start free"
                    className={cn(
                      "rounded-full px-5 font-semibold shadow-lg transition-transform hover:scale-[1.02]",
                      "bg-white text-slate-950 hover:bg-white/90"
                    )}
                  />
                </>
              ) : null}
            </ClientOnly>
          </div>

          <button
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            aria-controls="mobile-navigation"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-cyan xl:hidden"
            )}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={panelTransition}
            id="mobile-navigation"
            className="fixed inset-x-3 bottom-3 top-24 isolate overflow-hidden overflow-y-auto rounded-3xl border border-white/20 bg-background/95 shadow-2xl backdrop-blur-3xl backdrop-saturate-150 supports-[backdrop-filter:blur(1px)]:bg-background/75 xl:hidden"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/20 via-transparent to-landing-violet/10 dark:from-white/10"
            />
            <nav aria-label="Mobile navigation" className="flex min-h-full flex-col p-5 text-lg font-medium sm:p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explore Elora Visa</p>
              {NAV_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={section.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-14 items-center justify-between border-b border-border/50 px-2 transition-colors",
                    activeSection === section.id ? "text-foreground" : "text-foreground/65 hover:text-foreground"
                  )}
                >
                  {section.label}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </a>
              ))}
              <Link
                href="/affiliate"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-14 items-center justify-between border-b border-border/50 px-2 text-foreground/65 transition-colors hover:text-foreground"
              >
                Affiliate
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>

              <div className="mt-auto flex flex-col gap-3 pt-8">
                <ClientOnly>
                  {!loading && user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 h-12 rounded-full bg-gradient-to-r from-landing-cyan via-landing-blue to-landing-violet text-white font-semibold shadow-lg"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  ) : !loading ? (
                    <>
                      <LoginModal />
                      <SignupSheet desscription={"Start Free"} className={"w-full font-semibold shadow-lg"} />
                    </>
                  ) : null}
                </ClientOnly>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
