"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { Check, ChevronDown, Loader2, Users } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SELF, type FamilyMember } from "@/lib/family"

/** Family roster, active applicant and switching (lib/family.ts). */
function useFamily() {
  const [roster, setRoster] = useState<FamilyMember[]>([])
  const [active, setActive] = useState<string>(SELF)
  const [holderName, setHolderName] = useState("Me")
  const [activeName, setActiveName] = useState("")
  const [switching, setSwitching] = useState<string | null>(null)

  useEffect(() => {
    let unsubDoc: (() => void) | undefined
    const unsub = onAuthStateChanged(auth, (user) => {
      unsubDoc?.()
      if (!user) return
      unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
        const d = snap.data() ?? {}
        setRoster(d.familyRoster ?? [])
        setActive(d.activeMemberId || SELF)
        setHolderName(d.accountHolderName || (d.activeMemberId ? "Me" : d.fullName) || "Me")
        setActiveName(d.fullName || "")
      })
    })
    return () => {
      unsub()
      unsubDoc?.()
    }
  }, [])

  const switchTo = async (memberId: string) => {
    if (memberId === active) return
    const user = auth.currentUser
    if (!user) return
    setSwitching(memberId)
    try {
      const res = await fetch("/api/family/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ memberId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn't switch")
      // Every page re-reads the newly active applicant.
      window.location.reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't switch")
      setSwitching(null)
    }
  }

  const people = [{ id: SELF, name: holderName, relationship: "You" }, ...roster]
  return { hasFamily: roster.length > 0, people, active, activeName, switching, switchTo }
}

/**
 * Header switcher for family accounts, shown from md up. On phones the same
 * choice lives in the profile menu (FamilyMenuSection) so the header doesn't
 * crowd out the sidebar button. Hidden for accounts without members.
 */
export function FamilySwitcher() {
  const { hasFamily, people, active, activeName, switching, switchTo } = useFamily()
  if (!hasFamily) return null

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-10 max-w-[11rem] items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3 text-sm hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
          aria-label={`Showing ${active === SELF ? "your" : `${activeName}'s`} application. Switch family member`}
        >
          {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4 text-lp-azure" />}
          <span className="truncate font-medium">{active === SELF ? "Me" : activeName}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-lp-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Whose application?</DropdownMenuLabel>
          <PeopleItems people={people} active={active} switching={switching} onSelect={switchTo} />
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/family">Manage family</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/** The same choice inside the profile menu, phones only. */
export function FamilyMenuSection() {
  const { hasFamily, people, active, switching, switchTo } = useFamily()
  if (!hasFamily) return null

  return (
    <div className="md:hidden">
      <DropdownMenuLabel className="px-3 pt-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
        Whose application?
      </DropdownMenuLabel>
      <PeopleItems people={people} active={active} switching={switching} onSelect={switchTo} />
      <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-lp-azure">
        <Link href="/dashboard/family">Manage family</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-lp-line" />
    </div>
  )
}

function PeopleItems({
  people,
  active,
  switching,
  onSelect,
}: {
  people: { id: string; name: string; relationship: string }[]
  active: string
  switching: string | null
  onSelect: (id: string) => void
}) {
  return (
    <>
      {people.map((p) => (
        <DropdownMenuItem
          key={p.id}
          disabled={switching !== null}
          onSelect={() => onSelect(p.id)}
          className="flex items-center justify-between rounded-xl px-3 py-2"
        >
          <span className="min-w-0">
            <span className="block truncate">{p.name}</span>
            <span className="block text-xs text-muted-foreground">{p.relationship}</span>
          </span>
          {switching === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.id === active && <Check className="h-4 w-4 text-lp-azure" />}
        </DropdownMenuItem>
      ))}
    </>
  )
}
