import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { listPublishedRequirements } from "@/lib/countryRequirementsServer"

export const metadata: Metadata = {
  title: "Visa Requirements by Country",
  description: "Fees, processing times, required documents, proof of funds and embassy addresses for study, work, visit and family visas, by destination.",
}

// Admins edit entries in eloraadmin; an hour's delay before they show is fine.
export const revalidate = 3600

export default async function VisaRequirementsPage() {
  const entries = await listPublishedRequirements()
  const byCountry = new Map<string, typeof entries>()
  for (const e of entries) (byCountry.get(e.country) ?? byCountry.set(e.country, []).get(e.country)!).push(e)

  return (
    <MarketingPageShell
      eyebrow="Visa requirements"
      title="What each destination asks for."
      description="Fees, processing times, documents, proof of funds and embassy details for the visas our applicants apply for most."
    >
      <section className="bg-slate-50 px-4 py-20 dark:bg-slate-950 md:px-6 md:py-28">
        <div className="container mx-auto">
          {entries.length === 0 ? (
            <p className="text-lg text-muted-foreground">Requirement guides are being prepared. Check back soon.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...byCountry].map(([country, list]) => (
                <article key={country} className="rounded-3xl border border-border bg-background p-6 shadow-sm md:p-8">
                  <h2 className="text-xl font-bold">{country}</h2>
                  <ul className="mt-4 space-y-2">
                    {list.map((e) => (
                      <li key={e.slug}>
                        <Link href={`/visa-requirements/${e.slug}`} className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-muted">
                          <span>{e.visaType} visa</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
          <p className="mt-12 max-w-3xl text-sm text-muted-foreground">
            Requirements change. Always confirm current rules with the official immigration authority before you apply.
          </p>
        </div>
      </section>
    </MarketingPageShell>
  )
}
