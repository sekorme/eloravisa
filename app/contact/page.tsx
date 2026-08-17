import type { Metadata } from "next"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { ContactForm } from "@/components/landing/ContactForm"

export const metadata: Metadata = {
  title: "Contact Elora Visa",
  description: "Contact Elora Visa for account, subscription, AI tool, affiliate or technical support.",
}

const CONTACT_CHANNELS = [
  { icon: Mail, label: "Email", value: "info@eloravisa.com", href: "mailto:info@eloravisa.com" },
  { icon: Phone, label: "Phone", value: "+233 55 314 3196", href: "tel:+233553143196" },
  { icon: MessageCircle, label: "Telegram", value: "Join the community", href: "https://t.me/+wWazCHK2wEMzMzdk" },
]

export default function ContactPage() {
  return (
    <MarketingPageShell
      eyebrow="Contact and support"
      title="Tell us what you need help with."
      description="Choose a support category and prepare a clear message for the Elora Visa team. Never send sensitive documents through this form."
    >
      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 md:px-6 md:py-28">
        <div className="container mx-auto grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-4">
            {CONTACT_CHANNELS.map((channel) => (
              <a key={channel.label} href={channel.href} className="flex min-h-24 items-center gap-4 rounded-3xl border border-border bg-background p-5 transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue dark:focus-visible:ring-landing-cyan">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-landing-blue/10 text-landing-blue dark:bg-landing-cyan/10 dark:text-landing-cyan">
                  <channel.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{channel.label}</span>
                  <span className="mt-1 block font-semibold">{channel.value}</span>
                </span>
              </a>
            ))}
          </aside>
          <ContactForm />
        </div>
      </section>
    </MarketingPageShell>
  )
}
