"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { ArrowRight, Globe2 } from "lucide-react"
import { auth, db } from "@/firebase/client"
import { slugFor, type CountryRequirement } from "@/lib/countryRequirements"

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${amount}`
  }
}

/**
 * The requirements guide for the user's destination and visa type, from the
 * library admins maintain in eloraadmin. Hidden when there's no guide yet.
 */
export function CountryRequirementsCard() {
  const [entry, setEntry] = useState<CountryRequirement | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return
      try {
        const data = (await getDoc(doc(db, "users", user.uid))).data()
        const destination = data?.onboarding?.destination
        const visaType = data?.onboarding?.visaType
        if (!destination || !visaType) return
        const res = await fetch(`/api/requirements/${slugFor(destination, visaType)}`)
        if (res.ok) setEntry(await res.json())
      } catch {
        // Optional card: stay hidden on any failure.
      }
    })
    return () => unsub()
  }, [])

  if (!entry) return null

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
      <span className="inline-flex items-center gap-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
        <Globe2 className="h-3.5 w-3.5 text-lp-azure" /> {entry.country} {entry.visaType.toLowerCase()} visa
      </span>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {entry.fees[0] && (
          <div>
            <dt className="text-lp-muted">{entry.fees[0].label}</dt>
            <dd className="font-semibold">{money(entry.fees[0].amount, entry.fees[0].currency)}</dd>
          </div>
        )}
        {entry.processingTime && (
          <div>
            <dt className="text-lp-muted">Processing</dt>
            <dd className="font-semibold">{entry.processingTime}</dd>
          </div>
        )}
        {entry.funds && (
          <div className="col-span-2">
            <dt className="text-lp-muted">Proof of funds</dt>
            <dd className="font-semibold">
              {money(entry.funds.amount, entry.funds.currency)} {entry.funds.per === "trip" ? "for the trip" : `per ${entry.funds.per}`}
            </dd>
          </div>
        )}
      </dl>
      {entry.documents.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium">The embassy also lists</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-lp-muted">
            {entry.documents.slice(0, 5).map((d) => <li key={d.title}>{d.title}</li>)}
          </ul>
        </div>
      )}
      <Link href={`/visa-requirements/${entry.slug}`} className="flex items-center gap-1 text-sm font-medium text-lp-azure">
        Full requirements and embassy details <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
