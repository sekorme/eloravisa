import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Building2, Clock, ExternalLink, FileCheck2, Lightbulb, Receipt, Wallet } from "lucide-react"
import { MarketingPageShell } from "@/components/landing/MarketingPageShell"
import { getPublishedRequirement } from "@/lib/countryRequirementsServer"

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await getPublishedRequirement((await params).slug)
  if (!entry) return { title: "Visa requirements" }
  return {
    title: `${entry.country} ${entry.visaType} Visa Requirements`,
    description: entry.summary || `Fees, documents, proof of funds and embassy details for a ${entry.country} ${entry.visaType.toLowerCase()} visa.`,
    alternates: { canonical: `/visa-requirements/${entry.slug}` },
  }
}

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

function Section({ icon: Icon, title, children }: { icon: typeof Clock; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-background p-6 shadow-sm md:p-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <Icon className="h-5 w-5 text-landing-blue dark:text-landing-cyan" aria-hidden="true" /> {title}
      </h2>
      {children}
    </section>
  )
}

export default async function RequirementPage({ params }: Props) {
  const entry = await getPublishedRequirement((await params).slug)
  if (!entry) notFound()

  return (
    <MarketingPageShell
      eyebrow={`${entry.country} · ${entry.visaType} visa`}
      title={`${entry.country} ${entry.visaType.toLowerCase()} visa requirements`}
      description={entry.summary || "What to prepare, what it costs, and where to apply."}
    >
      <div className="bg-slate-50 px-4 py-16 dark:bg-slate-950 md:px-6 md:py-24">
        <div className="container mx-auto grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {entry.documents.length > 0 && (
              <Section icon={FileCheck2} title="Documents you'll need">
                <ul className="space-y-3">
                  {entry.documents.map((d) => (
                    <li key={d.title}>
                      <p className="font-medium">{d.title}</p>
                      {d.notes && <p className="text-sm text-muted-foreground">{d.notes}</p>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {entry.funds && (
              <Section icon={Wallet} title="Proof of funds">
                <p className="text-2xl font-bold">
                  {money(entry.funds.amount, entry.funds.currency)}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {entry.funds.per === "trip" ? "for the whole trip" : `per ${entry.funds.per}`}
                  </span>
                </p>
                {entry.funds.notes && <p className="mt-2 text-muted-foreground">{entry.funds.notes}</p>}
              </Section>
            )}
            {entry.tips.length > 0 && (
              <Section icon={Lightbulb} title="Tips from our team">
                <ul className="list-disc space-y-2 pl-5">
                  {entry.tips.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </Section>
            )}
            {entry.embassies.length > 0 && (
              <Section icon={Building2} title="Where to apply">
                <div className="grid gap-4 sm:grid-cols-2">
                  {entry.embassies.map((e) => (
                    <div key={`${e.name}-${e.city}`} className="rounded-2xl border border-border p-4 text-sm">
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-muted-foreground">{[e.address, e.city].filter(Boolean).join(", ")}</p>
                      {e.phone && <p className="mt-1">{e.phone}</p>}
                      {e.website && (
                        <a href={e.website} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-landing-blue underline dark:text-landing-cyan">
                          Website <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            <Section icon={Receipt} title="Fees">
              {entry.fees.length === 0 ? <p className="text-muted-foreground">Check the official site.</p> : (
                <ul className="space-y-2">
                  {entry.fees.map((f) => (
                    <li key={f.label} className="flex justify-between gap-3">
                      <span>{f.label}</span>
                      <span className="font-semibold tabular-nums">{money(f.amount, f.currency)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section icon={Clock} title="Timing">
              <dl className="space-y-2 text-sm">
                {entry.processingTime && <div><dt className="text-muted-foreground">Processing time</dt><dd className="font-medium">{entry.processingTime}</dd></div>}
                {entry.validity && <div><dt className="text-muted-foreground">Visa validity</dt><dd className="font-medium">{entry.validity}</dd></div>}
              </dl>
            </Section>
            <div className="rounded-3xl bg-landing-navy p-6 text-white md:p-8">
              <p className="text-lg font-semibold">Get your application ready</p>
              <p className="mt-2 text-sm text-white/70">Upload your documents for an AI review, check your proof of funds, and practise the interview.</p>
              <Link href="/signup" className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-landing-navy">Start free</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {entry.updatedAt && <>Last reviewed {new Date(entry.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. </>}
              Requirements change; confirm with the{" "}
              {entry.officialUrl ? <a href={entry.officialUrl} target="_blank" rel="noreferrer" className="underline">official source</a> : "official immigration authority"} before applying.
            </p>
          </aside>
        </div>
      </div>
    </MarketingPageShell>
  )
}
