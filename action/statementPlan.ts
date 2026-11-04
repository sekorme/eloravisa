"use server"

import { db } from "@/firebase/admin"
import { verifyActionUser } from "@/lib/actionAuth"
import { getRequirementFor } from "@/lib/countryRequirementsServer"
import { getUsdToGhsRate } from "@/lib/exchangeRate"
import type { FundsGuidance } from "@/lib/countryRequirements"

export interface StatementContext {
  destination: string | null
  visaType: string | null
  nationality: string | null
  /** The embassy's funds guidance for this destination and visa type, if admins have published one. */
  funds: FundsGuidance | null
  /** USD→GHS, so GHS accounts can be compared with USD targets. Null if unavailable. */
  usdToGhs: number | null
}

/** What the statement builder needs from the server. Free; reads only. */
export async function getStatementContext(idToken: string): Promise<StatementContext | null> {
  const user = await verifyActionUser(idToken)
  if (!user) return null
  const profile = (await db.collection("users").doc(user.uid).get()).data() || {}
  const destination = profile.onboarding?.destination || null
  const visaType = profile.onboarding?.visaType || null
  const requirement = await getRequirementFor(destination, visaType).catch(() => null)
  const funds = requirement?.funds ?? null
  const usdToGhs = funds?.currency === "USD" ? await getUsdToGhsRate().catch(() => null) : null
  return {
    destination,
    visaType,
    nationality: profile.country || profile.nationality || profile.onboarding?.nationality || null,
    funds,
    usdToGhs,
  }
}
