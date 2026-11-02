/**
 * Country visa requirements library: one entry per destination + visa type,
 * edited by admins in eloraadmin (app/admin/requirements) and stored at
 * country_requirements/{slug}. Read here with the Admin SDK for the public
 * /visa-requirements pages, the dashboard, and the funds checker.
 *
 * Types and slugFor are shared with the browser; reads are server-only
 * (see lib/countryRequirementsServer.ts).
 */

export interface RequirementFee {
  label: string
  amount: number
  currency: string
}

export interface RequirementDocument {
  title: string
  notes?: string
}

export interface RequirementEmbassy {
  name: string
  city: string
  address?: string
  phone?: string
  website?: string
}

export interface FundsGuidance {
  amount: number
  currency: string
  /** What the amount covers: per month of stay, per year, or the whole trip. */
  per: "month" | "year" | "trip"
  notes?: string
}

export interface CountryRequirement {
  slug: string
  country: string
  visaType: string
  summary: string
  fees: RequirementFee[]
  processingTime: string
  validity: string
  documents: RequirementDocument[]
  funds: FundsGuidance | null
  embassies: RequirementEmbassy[]
  tips: string[]
  officialUrl: string
  published: boolean
  updatedAt: string | null
}

/** "United States" + "Study" -> "united-states-study". */
export function slugFor(country: string, visaType: string): string {
  return `${country}-${visaType}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
