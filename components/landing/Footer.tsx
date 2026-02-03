"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import {Twitter,Facebook, Instagram, Linkedin, Github, Send} from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
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
  }, [])

  return (
    <footer ref={footerRef} className="bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800">
      <div className="container px-4 mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-1 md:col-span-2 footer-content">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/eloravisa.PNG" alt="Elora Visa Logo" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">Elora Visa</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              Empowering applicants to navigate the visa process with confidence. No agents, just expert guidance and AI tools.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-blue-700 transition-colors">
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>

                <Link href="https://t.me/+wWazCHK2wEMzMzdk" className="text-slate-400 hover:text-blue-400 transition-colors">
                    <Send className="w-5 h-5" />
                    <span className="sr-only">Telegram</span>
                </Link>
            </div>
          </div>

          <div className="footer-content">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div className="footer-content">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/legal/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link href="/legal/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div className="footer-content">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="mailto:info@eloravisa.com" className="hover:text-foreground transition-colors">
                  info@eloravisa.com
                </a>
              </li>
              <li>
                <a href="tel:+233553143196" className="hover:text-foreground transition-colors">
                  +233 55 314 3196
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground footer-content">
          <p>© {new Date().getFullYear()} Elora Visa. All rights reserved.</p>
          <p>Made with ❤️ for global citizens.</p>
        </div>
      </div>
    </footer>
  )
}
