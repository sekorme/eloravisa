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
    <section className="relative overflow-hidden bg-slate-50 py-20 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white md:py-28">
      <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 rounded-full bg-landing-blue/10 blur-3xl dark:bg-landing-blue/15" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-landing-violet/10 blur-3xl dark:bg-landing-violet/15" aria-hidden="true" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-landing-blue/20 bg-landing-blue/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-landing-blue dark:border-landing-cyan/20 dark:bg-landing-cyan/10 dark:text-landing-cyan">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Security &amp; Transparency
          </div>
          <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
            Your documents deserve serious protection
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/65">
            Here&apos;s exactly what we do to keep your preparation data safe.
          </p>
        </div>

        <div className="mx-auto mb-14 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MEASURES.map((m) => (
            <article key={m.title} className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-landing-cyan/15 to-landing-violet/15 text-landing-blue dark:from-landing-cyan/20 dark:to-landing-violet/20 dark:text-landing-cyan">
                <m.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-bold">{m.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-white/60">{m.desc}</p>
            </article>
          ))}
        </div>

        <nav aria-label="Security and legal policies" className="mb-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-sm text-slate-600 underline underline-offset-4 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue dark:text-white/60 dark:hover:text-white dark:focus-visible:ring-landing-cyan">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mx-auto max-w-2xl border-t border-slate-200 pt-8 text-center dark:border-white/10">
          <p className="flex items-start justify-center gap-2 text-xs leading-relaxed text-slate-500 dark:text-white/50">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
