"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { Bell, CheckCheck, Loader2, Settings, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import {
  actionLabel,
  internalPath,
  markRead,
  removeNotifications,
  timeAgo,
  useNotifications,
  type AppNotification,
} from "@/lib/notificationsClient"
import { NOTIFICATION_CATEGORIES, type NotificationCategory } from "@/lib/notificationPrefs"

type Filter = "all" | "unread" | NotificationCategory

const DAY = 86_400_000

function groupLabel(d: Date | null, now: number) {
  if (!d) return "Earlier"
  const startOfToday = new Date(now).setHours(0, 0, 0, 0)
  if (d.getTime() >= startOfToday) return "Today"
  if (d.getTime() >= startOfToday - DAY) return "Yesterday"
  if (d.getTime() >= startOfToday - 6 * DAY) return "This week"
  return "Earlier"
}

export default function NotificationsPage() {
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [busy, setBusy] = useState<string | null>(null)
  const [now] = useState(() => Date.now())
  const items = useNotifications(uid)

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), [])

  // Bell links with no destination land here as #id: scroll to and mark it.
  useEffect(() => {
    if (!items || !uid) return
    const id = window.location.hash.slice(1)
    const n = id && items.find((x) => x.id === id)
    if (!n) return
    document.getElementById(`n-${id}`)?.scrollIntoView({ block: "center" })
    if (!n.read) markRead(uid, [id]).catch(() => {})
  }, [items, uid])

  const list = useMemo(() => {
    const all = items ?? []
    if (filter === "all") return all
    if (filter === "unread") return all.filter((n) => !n.read)
    return all.filter((n) => n.category === filter)
  }, [items, filter])

  const groups = useMemo(() => {
    const map = new Map<string, AppNotification[]>()
    for (const n of list) {
      const label = groupLabel(n.createdAt, now)
      ;(map.get(label) ?? map.set(label, []).get(label)!).push(n)
    }
    return [...map]
  }, [list, now])

  const all = useMemo(() => items ?? [], [items])
  const unread = all.filter((n) => !n.read)
  const read = all.filter((n) => n.read)
  const counts = useMemo(() => {
    const c: Partial<Record<NotificationCategory, number>> = {}
    for (const n of all) c[n.category] = (c[n.category] ?? 0) + 1
    return c
  }, [all])

  const run = async (key: string, fn: () => Promise<unknown>, done?: string) => {
    if (!uid) return
    setBusy(key)
    try {
      await fn()
      if (done) toast.success(done)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  const open = (n: AppNotification) => {
    if (uid && !n.read) markRead(uid, [n.id]).catch(() => {})
    const path = internalPath(n.url)
    if (path) router.push(path)
    else if (n.url) window.open(n.url, "_blank", "noopener")
  }

  const chips: { id: Filter; label: string; count?: number }[] = [
    { id: "all", label: "All", count: all.length },
    { id: "unread", label: "Unread", count: unread.length },
    ...NOTIFICATION_CATEGORIES.filter((c) => counts[c.id]).map((c) => ({ id: c.id as Filter, label: c.label, count: counts[c.id] })),
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
            <Bell className="h-3.5 w-3.5 text-lp-azure" /> Notifications
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">Notifications</h1>
          <p className="text-lp-muted">Everything from the last 30 days. {unread.length > 0 ? `${unread.length} unread.` : "You're all caught up."}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/settings#notifications"><Settings className="mr-1.5 h-4 w-4" /> Email and push settings</Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter notifications">
          {chips.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={filter === c.id}
              onClick={() => setFilter(c.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${filter === c.id ? "border-lp-azure bg-lp-azure text-white" : "border-lp-line bg-lp-card hover:bg-lp-card-2"}`}
            >
              {c.label}{c.count ? <span className="ml-1.5 opacity-75">{c.count}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="rounded-full" disabled={busy !== null || unread.length === 0}
            onClick={() => run("read-all", () => markRead(uid!, unread.map((n) => n.id)), "All marked as read")}>
            {busy === "read-all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCheck className="mr-1.5 h-4 w-4" /> Mark all as read</>}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-red-600" disabled={busy !== null || read.length === 0}
            onClick={() => run("clear", () => removeNotifications(uid!, read.map((n) => n.id)), `Cleared ${read.length} read notification${read.length === 1 ? "" : "s"}`)}>
            {busy === "clear" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="mr-1.5 h-4 w-4" /> Clear read</>}
          </Button>
        </div>
      </div>

      {items === null ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-lp-azure" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-[1.5rem] border border-lp-line bg-lp-card p-10 text-center text-lp-muted">
          {filter === "all" ? "No notifications yet. Reminders and updates will appear here." : "Nothing here."}
        </div>
      ) : (
        groups.map(([label, group]) => (
          <section key={label} className="space-y-2">
            <h2 className="px-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">{label}</h2>
            <ul className="space-y-2">
              {group.map((n) => (
                <li
                  key={n.id}
                  id={`n-${n.id}`}
                  className={`flex gap-3 rounded-[1.25rem] border p-4 ${n.read ? "border-lp-line bg-lp-card" : "border-lp-azure/30 bg-lp-sky"}`}
                >
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-lp-azure"}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className={n.read ? "font-medium" : "font-semibold"}>
                        {n.title}{!n.read && <span className="sr-only"> (unread)</span>}
                      </p>
                      <span className="shrink-0 text-xs text-lp-muted">{timeAgo(n.createdAt, now)}</span>
                    </div>
                    {/* Full text; emails and reminders use blank lines between paragraphs. */}
                    <p className="whitespace-pre-line text-sm text-lp-muted">{n.body}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {n.url && (
                        <Button size="sm" className="h-8 rounded-full" onClick={() => open(n)}>{actionLabel(n)}</Button>
                      )}
                      {!n.read && (
                        <Button size="sm" variant="ghost" className="h-8 rounded-full" disabled={busy !== null}
                          onClick={() => run(`read-${n.id}`, () => markRead(uid!, [n.id]))}>
                          Mark as read
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="ml-auto h-8 rounded-full text-lp-muted hover:text-red-600" disabled={busy !== null}
                        aria-label={`Delete "${n.title}"`} onClick={() => run(`del-${n.id}`, () => removeNotifications(uid!, [n.id]))}>
                        {busy === `del-${n.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
