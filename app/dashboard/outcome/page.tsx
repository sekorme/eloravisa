"use client"

import Link from "next/link"
import { HeartHandshake, MessageSquareQuote, PartyPopper, Sparkles } from "lucide-react"
import { DashboardDataProvider } from "@/context/DashboardDataContext"
import { OutcomeCard } from "@/components/dashboard/OutcomeCard"
import { dashCard } from "@/components/dashboard/dashboardStyles"

/**
 * Share your outcome: report the visa decision and, after an approval, a
 * testimonial. Always available, unlike the dashboard card, which only asks
 * once a saved appointment has passed.
 */
export default function OutcomePage() {
  return (
    <DashboardDataProvider>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 text-lp-fg md:px-8 md:py-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
            <PartyPopper className="h-3.5 w-3.5 text-lp-azure" /> Your outcome
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.045em] md:text-4xl">Share your visa outcome</h1>
          <p className="max-w-2xl text-lp-muted">
            Tell us how your application went. If you were approved, you can share a few words for other applicants. Either way, the questions you were asked make everyone&apos;s practice interviews more realistic.
          </p>
        </div>

        <OutcomeCard always />

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: MessageSquareQuote, title: "Your story", text: "Approved stories appear on our Success stories page after a quick review, with your first name only." },
            { icon: Sparkles, title: "Your questions", text: "Shared anonymously in the interview question bank." },
            { icon: HeartHandshake, title: "If you were refused", text: "Refusal recovery explains each reason and builds a plan to reapply." },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className={`p-4 ${dashCard}`}>
              <Icon className="h-5 w-5 text-lp-azure" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold">{title}</p>
              <p className="text-xs text-lp-muted">{text}</p>
            </li>
          ))}
        </ul>

        <p className="text-sm text-lp-muted">
          See what others shared on the{" "}
          <Link href="/success-stories" className="font-medium text-lp-azure hover:underline">Success stories</Link> page.
        </p>
      </div>
    </DashboardDataProvider>
  )
}
