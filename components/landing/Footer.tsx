"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Send } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  useEffect(() => {
    if (!mounted || !footerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(".footer-content", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      })
    }, footerRef)

    return () => ctx.revert()
  }, [mounted])

  return (
    <footer ref={footerRef} className="relative bg-slate-50 dark:bg-[#020205] border-t border-slate-200 dark:border-slate-800 overflow-hidden">

      <div className="container relative z-10 px-4 mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-16">
          <div className="col-span-1 md:col-span-2 footer-content">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                <Image src="/eloravisa.PNG" alt="Elora Visa Logo" width={32} height={32} className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Elora Visa</span>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mb-8">
              Empowering applicants to navigate the visa process with confidence. No agents, just expert guidance and AI-powered tools for a transparent journey.
            </p>
            {/* Facebook, Instagram and LinkedIn are hidden until real profile URLs are configured. */}
            <div className="flex gap-5">
              {[
                { icon: Send, href: "https://t.me/+wWazCHK2wEMzMzdk", color: "hover:text-blue-400", label: "Telegram" }
              ].map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href} 
                  className={`p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 ${social.color} transition-all hover:-translate-y-1 shadow-sm hover:shadow-md`}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-content">
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-foreground/80">Product</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#ai-tools" className="hover:text-blue-500 transition-colors flex items-center gap-2">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-blue-500 transition-colors flex items-center gap-2">How it Works</Link></li>
              <li><Link href="#pricing" className="hover:text-blue-500 transition-colors flex items-center gap-2">Pricing</Link></li>
              <li><Link href="#success-stories" className="hover:text-blue-500 transition-colors flex items-center gap-2">Success Stories</Link></li>
            </ul>
          </div>

          <div className="footer-content">
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-foreground/80">Legal</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/legal/privacy-policy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms-of-service" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/cookie-policy" className="hover:text-blue-500 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/legal/disclaimer" className="hover:text-blue-500 transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div className="footer-content">
            <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-foreground/80">Contact</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Email Us</span>
                <a href="mailto:info@eloravisa.com" className="hover:text-blue-500 transition-colors font-medium text-foreground/80">
                  info@eloravisa.com
                </a>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Call Us</span>
                <a href="tel:+233553143196" className="hover:text-blue-500 transition-colors font-medium text-foreground/80">
                  +233 55 314 3196
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground footer-content">
          <p className="font-medium">© {new Date().getFullYear()} Elora Visa. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            Made with <span className="text-red-500 animate-pulse">❤️</span> for global citizens.
          </p>
        </div>
      </div>
    </footer>
  )
}
