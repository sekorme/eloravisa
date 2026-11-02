/**
 * Family / group applications: one account manages several applicants.
 *
 * Design ("profile swap"): exactly one applicant is active at a time, and the
 * active applicant's data lives where the whole app already reads it
 * (users/{uid}.onboarding, .documents, .appointment, ..., plus the reviews
 * subcollection). Switching (lib/familyServer.ts) stashes the active
 * applicant's fields and reviews in users/{uid}.familyMembers[id] and
 * restores the target's, in one transaction. Nothing else in the app needs
 * to know about families.
 *
 *   familyRoster        [{ id, name, relationship }]  members besides the holder
 *   familyMembers[id]   stashed profile of each inactive applicant ("self" = holder)
 *   activeMemberId      null when the account holder is active
 *   accountHolderName   the holder's own name (fullName follows the active applicant)
 *   familySeats         [{ expiresAt }] extra members bought on top of the plan
 *
 * interview_sessions carry a memberId instead (they're written server-side
 * and listed by date), and readers filter them with sessionBelongsTo.
 */

import { FAMILY_INCLUDED_MEMBERS } from "@/lib/billing/plans"

export const SELF = "self"

/** Fields that belong to the applicant, not the account. Swapped on switch. */
export const APPLICANT_FIELDS = [
  "fullName",
  "country",
  "onboarding",
  "completedOnboarding",
  "documents",
  "appointment",
  "financialAnalysis",
  "refusalRecovery",
  "visaOutcome",
] as const

export const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Relative", "Friend", "Colleague", "Other"] as const

export interface FamilyMember {
  id: string
  name: string
  relationship: string
  createdAt: number
}

/** Members the account may have right now, besides the holder. */
export function familyCapacity(user: { planId?: unknown; subscriptionExpiresAt?: unknown; familySeats?: { expiresAt: number }[] } | null | undefined, now: number): number {
  if (!user || user.planId !== "family" || !(Number(user.subscriptionExpiresAt) > now)) return 0
  const extra = (user.familySeats ?? []).filter((s) => s.expiresAt > now).length
  return FAMILY_INCLUDED_MEMBERS + extra
}

export function activeMemberOf(user: { activeMemberId?: unknown } | null | undefined): string {
  return typeof user?.activeMemberId === "string" && user.activeMemberId ? user.activeMemberId : SELF
}

/** Whether an interview session belongs to the given applicant (untagged = holder). */
export function sessionBelongsTo(session: { memberId?: unknown }, memberId: string): boolean {
  return (typeof session.memberId === "string" && session.memberId ? session.memberId : SELF) === memberId
}
