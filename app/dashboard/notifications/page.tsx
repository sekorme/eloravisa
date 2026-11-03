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
import { CategoryIcon } from "@/components/notifications/CategoryIcon"
import { dashCard } from "@/components/dashboard/dashboardStyles"

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
  const [expanded, setExpanded] = useState<string | null>(null)
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
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-5 text-lp-fg md:px-6">
      {/* Compact header: title and counts left, bulk actions right. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Notifications</h1>
          <p className="text-sm text-lp-muted">
            {unread.length > 0 ? `${unread.length} unread · ` : ""}last 30 days
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 rounded-full" disabled={busy !== null || unread.length === 0}
            onClick={() => run("read-all", () => markRead(uid!, unread.map((n) => n.id)), "All marked as read")}>
            {busy === "read-all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read</>}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 rounded-full text-lp-muted hover:text-red-600" disabled={busy !== null || read.length === 0}
            onClick={() => run("clear", () => removeNotifications(uid!, read.map((n) => n.id)), `Cleared ${read.length} read notification${read.length === 1 ? "" : "s"}`)}>
            {busy === "clear" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="mr-1.5 h-4 w-4" /> Clear read</>}
          </Button>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="Email and push settings">
            <Link href="/dashboard/settings#notifications"><Settings className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[232px_1fr]">
        {/* Filters: a scrollable chip row on phones, a side list on desktop. */}
        <nav aria-label="Filter notifications" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <ul className="flex gap-1.5 lg:sticky lg:top-24 lg:flex-col lg:gap-0.5">
            {chips.map((c) => (
              <li key={c.id} className="shrink-0">
                <button
                  onClick={() => setFilter(c.id)}
                  aria-current={filter === c.id}
                  className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors lg:rounded-xl lg:py-2 ${
                    filter === c.id ? "bg-lp-azure text-white" : "bg-lp-card text-lp-fg hover:bg-lp-card-2 lg:bg-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {c.id !== "all" && c.id !== "unread" && <CategoryIcon category={c.id} className="hidden h-6 w-6 lg:flex" />}
                    {c.label}
                  </span>
                  {c.count ? <span className={`text-xs tabular-nums ${filter === c.id ? "text-white/80" : "text-lp-muted"}`}>{c.count}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* One card; rows separated by thin dividers. */}
        <div className={`overflow-hidden ${dashCard}`}>
          {items === null ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-lp-azure" /></div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lp-sky text-lp-azure"><Bell className="h-5 w-5" /></span>
              <p className="font-medium">{filter === "unread" ? "You're all caught up" : "Nothing here yet"}</p>
              <p className="text-sm text-lp-muted">{filter === "all" ? "Reminders and updates will appear here." : "Try another filter."}</p>
            </div>
          ) : (
            groups.map(([label, group]) => (
              <section key={label}>
                <h2 className="border-b border-lp-line bg-lp-card-2 px-4 py-1.5 text-xs font-medium text-lp-muted">{label}</h2>
                <ul className="divide-y divide-lp-line">
                  {group.map((n) => {
                    const isOpen = expanded === n.id
                    return (
                      <li key={n.id} id={`n-${n.id}`} className={`group relative flex gap-3 px-4 py-3 ${n.read ? "" : "bg-lp-sky/50"}`}>
                        <span className="relative h-fit shrink-0">
                          <CategoryIcon category={n.category} />
                          {!n.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-lp-azure ring-2 ring-lp-card" aria-hidden="true" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className={`truncate text-sm ${n.read ? "font-medium" : "font-semibold"}`}>
                              {n.title}{!n.read && <span className="sr-only"> (unread)</span>}
                            </p>
                            <span className="shrink-0 text-xs text-lp-muted">{timeAgo(n.createdAt, now)}</span>
                          </div>
                          {/* Two lines until tapped; reminders use blank lines between paragraphs. */}
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : n.id)}
                            className={`mt-0.5 w-full text-left text-sm text-lp-muted ${isOpen ? "block whitespace-pre-line" : "line-clamp-2"}`}
                            aria-expanded={isOpen}
                          >
                            {isOpen ? n.body : n.body.replace(/\s*\n+\s*/g, " ")}
                          </button>
                          <div className="mt-2 flex items-center gap-1">
                            {n.url && (
                              <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-xs" onClick={() => open(n)}>{actionLabel(n)}</Button>
                            )}
                            <span className="ml-auto flex items-center gap-0.5">
                              {!n.read && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-lp-muted hover:text-lp-azure" disabled={busy !== null}
                                  aria-label={`Mark "${n.title}" as read`} onClick={() => run(`read-${n.id}`, () => markRead(uid!, [n.id]))}>
                                  <CheckCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-lp-muted hover:text-red-600" disabled={busy !== null}
                                aria-label={`Delete "${n.title}"`} onClick={() => run(`del-${n.id}`, () => removeNotifications(uid!, [n.id]))}>
                                {busy === `del-${n.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
