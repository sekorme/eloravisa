"use client"

import Link from "next/link"
import { ShieldCheck, Lock, KeyRound, FolderLock, FileText, Info } from "lucide-react"

const MEASURES = [
  {
    icon: KeyRound,
    title: "Secure authentication",
    desc: "Sign-in is handled through Firebase Authentication, with credentials never stored on our own servers.",
  },
  {
    icon: Lock,
    title: "Encrypted data transmission",
    desc: "All traffic between your browser and Elora Visa is sent over HTTPS/TLS-encrypted connections.",
  },
  {
    icon: FolderLock,
    title: "Controlled document access",
    desc: "Your documents and application data are scoped to your account and are not visible to other applicants.",
  },
  {
    icon: FileText,
    title: "Transparent privacy policy",
    desc: "We publish exactly what data we collect, how it's used, and how you can request its deletion.",
  },
]

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms-of-service" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Disclaimer", href: "/legal/disclaimer" },
]

export function TrustSection() {
  return (
    <section className="relative py-20 md:py-28 bg-[#050510] text-white overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-landing-blue/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-landing-violet/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-landing-cyan mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security &amp; Transparency
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Your documents deserve serious protection
          </h2>
          <p className="text-white/60 text-lg">
            Here&apos;s exactly what we do to keep your preparation data safe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14 max-w-6xl mx-auto">
          {MEASURES.map((m) => (
            <div key={m.title} className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-landing-cyan/20 to-landing-violet/20 flex items-center justify-center mb-4 text-landing-cyan">
                <m.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">{m.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-white/60 hover:text-white underline underline-offset-4 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center border-t border-white/10 pt-8">
          <p className="text-xs text-white/50 leading-relaxed flex items-start gap-2 justify-center">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Elora Visa provides self-help educational guidance and AI-powered preparation tools. It is not a law
              firm, travel agency, embassy or government institution and does not provide legal advice. Visa
              decisions are made solely by the appropriate immigration authorities.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
