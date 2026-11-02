"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import countries from "world-countries"
import { Loader2, Plus, Trash2, UserRound, Users } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FAMILY_INCLUDED_MEMBERS, SUBSCRIPTION_PLANS } from "@/lib/billing/plans"
import { RELATIONSHIPS, SELF, familyCapacity, type FamilyMember } from "@/lib/family"

const COUNTRY_NAMES = countries.map((c) => c.name.common).sort((a, b) => a.localeCompare(b))
const VISA_TYPES = ["Study", "Visit", "Work", "Family"]

interface AccountData {
  planId?: string
  subscriptionExpiresAt?: number
  familySeats?: { expiresAt: number }[]
  familyRoster?: FamilyMember[]
  activeMemberId?: string | null
  familyMembers?: Record<string, { onboarding?: { destination?: string; visaType?: string } }>
  onboarding?: { destination?: string; visaType?: string }
  fullName?: string
}

async function call(path: string, init: RequestInit) {
  const user = auth.currentUser
  if (!user) throw new Error("Please sign in")
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}`, ...init.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || "Something went wrong")
  return data
}

export default function FamilyPage() {
  const [account, setAccount] = useState<AccountData | null>(null)
  const [now] = useState(() => Date.now())
  const [form, setForm] = useState({ name: "", relationship: "Spouse", destination: "", visaType: "", nationality: "" })
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let unsubDoc: (() => void) | undefined
    const unsub = onAuthStateChanged(auth, (user) => {
      unsubDoc?.()
      if (!user) return
      unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
        const d = (snap.data() ?? {}) as AccountData
        setAccount(d)
        // Default new members to the holder's trip, the common case.
        setForm((f) => (f.destination ? f : { ...f, destination: d.onboarding?.destination ?? "", visaType: d.onboarding?.visaType ?? "" }))
      })
    })
    return () => {
      unsub()
      unsubDoc?.()
    }
  }, [])

  const roster = useMemo(() => account?.familyRoster ?? [], [account])
  const capacity = familyCapacity(account, now)
  const onFamilyPlan = account?.planId === "family" && Number(account?.subscriptionExpiresAt) > now
  const full = roster.length >= capacity

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy("add")
    try {
      await call("/api/family/members", { method: "POST", body: JSON.stringify(form) })
      toast.success(`${form.name} added. Switch to them from the menu at the top to start their application.`)
      setForm((f) => ({ ...f, name: "", nationality: "" }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add the member")
    } finally {
      setBusy(null)
    }
  }

  const remove = async (m: FamilyMember) => {
    if (!confirm(`Remove ${m.name}? Their documents list, reviews and appointment in Elora Visa will be deleted. This can't be undone.`)) return
    setBusy(m.id)
    try {
      await call(`/api/family/members/${m.id}`, { method: "DELETE" })
      toast.success(`${m.name} removed`)
      if (account?.activeMemberId === m.id) window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove the member")
    } finally {
      setBusy(null)
    }
  }

  const switchTo = async (id: string) => {
    setBusy(`switch-${id}`)
    try {
      await call("/api/family/switch", { method: "POST", body: JSON.stringify({ memberId: id }) })
      window.location.href = "/dashboard"
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't switch")
      setBusy(null)
    }
  }

  if (!account) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-lp-azure" /></div>

  const activeId = account.activeMemberId || SELF
  const tripOf = (id: string) => {
    const o = id === activeId ? account.onboarding : account.familyMembers?.[id]?.onboarding
    return o?.destination ? `${o.destination}${o.visaType ? ` · ${o.visaType}` : ""}` : "Not set up yet"
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <Users className="h-3.5 w-3.5 text-lp-azure" /> Family & group
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">Applying together</h1>
        <p className="max-w-2xl text-lp-muted">
          Manage applications for your spouse, children, parents or a study group from one account. Each person has their own documents, reviews, interviews, appointment and readiness score, and everyone shares your tokens.
        </p>
      </div>

      {!onFamilyPlan && (
        <div className="space-y-3 rounded-[1.5rem] border border-lp-azure/30 bg-lp-sky p-6">
          <p className="font-display text-xl font-semibold">Family Plan · ${SUBSCRIPTION_PLANS.FAMILY.price}/month</p>
          <p className="text-sm text-lp-muted">
            You plus {FAMILY_INCLUDED_MEMBERS} family members, {SUBSCRIPTION_PLANS.FAMILY.tokens} shared tokens, the AI assistant and the Telegram group. Extra members are ${SUBSCRIPTION_PLANS.FAMILY_SEAT.price}/month each.
            {roster.length > 0 && " Your family members' applications are kept; renew to add or change members."}
          </p>
          <Button asChild className="rounded-full"><Link href="/dashboard/subscription#family">Get the Family Plan</Link></Button>
        </div>
      )}

      <div className="space-y-3 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-semibold">Members</h2>
          {onFamilyPlan && <span className="text-sm text-lp-muted">{roster.length} of {capacity} places used</span>}
        </div>
        <ul className="divide-y divide-lp-line">
          {[{ id: SELF, name: account.activeMemberId ? "You (account holder)" : `${account.fullName ?? "You"} (you)`, relationship: "Account holder", createdAt: 0 }, ...roster].map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lp-sky text-lp-azure"><UserRound className="h-4 w-4" /></span>
                <div>
                  <p className="font-medium">{m.name} {m.id === activeId && <span className="ml-1 rounded-full bg-lp-azure/10 px-2 py-0.5 text-xs text-lp-azure">Showing now</span>}</p>
                  <p className="text-xs text-lp-muted">{m.relationship} · {tripOf(m.id)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {m.id !== activeId && (
                  <Button size="sm" variant="outline" className="rounded-full" disabled={busy !== null} onClick={() => switchTo(m.id)}>
                    {busy === `switch-${m.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Switch to"}
                  </Button>
                )}
                {m.id !== SELF && (
                  <Button size="sm" variant="ghost" className="rounded-full text-red-600" disabled={busy !== null} onClick={() => remove(m)} aria-label={`Remove ${m.name}`}>
                    {busy === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {onFamilyPlan && (full ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-lp-line bg-lp-card p-6">
          <div>
            <p className="font-medium">All {capacity} places are used</p>
            <p className="text-sm text-lp-muted">Add another member for ${SUBSCRIPTION_PLANS.FAMILY_SEAT.price}/month (includes {SUBSCRIPTION_PLANS.FAMILY_SEAT.tokens} tokens).</p>
          </div>
          <Button asChild className="rounded-full"><Link href="/dashboard/subscription#family">Add a place</Link></Button>
        </div>
      ) : (
        <form onSubmit={add} className="space-y-4 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
          <h2 className="font-display text-xl font-semibold">Add a member</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fm-name">Full name (as on their passport)</Label>
              <Input id="fm-name" required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-rel">Relationship</Label>
              <select id="fm-rel" className="h-9 w-full rounded-md border border-lp-line bg-transparent px-2 text-sm" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
                {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-dest">Destination</Label>
              <select id="fm-dest" className="h-9 w-full rounded-md border border-lp-line bg-transparent px-2 text-sm" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}>
                <option value="">Choose later</option>
                {COUNTRY_NAMES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fm-visa">Visa type</Label>
              <select id="fm-visa" className="h-9 w-full rounded-md border border-lp-line bg-transparent px-2 text-sm" value={form.visaType} onChange={(e) => setForm({ ...form, visaType: e.target.value })}>
                <option value="">Choose later</option>
                {VISA_TYPES.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-lp-muted">Without a destination and visa type, they&apos;ll go through the short setup the first time you switch to them.</p>
          <Button type="submit" className="rounded-full" disabled={busy !== null || !form.name.trim()}>
            {busy === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1.5 h-4 w-4" /> Add member</>}
          </Button>
        </form>
      ))}
    </div>
  )
}
