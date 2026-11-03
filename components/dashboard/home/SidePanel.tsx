"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { CategoryIcon } from "@/components/notifications/CategoryIcon"
import { auth } from "@/firebase/client"
import type { Appointment } from "@/hooks/useReadiness"
import { fetchLiveSessions, formatSessionTime, type LiveSession } from "@/lib/liveSessions"
import { internalPath, timeAgo, useNotifications } from "@/lib/notificationsClient"
import { dashCard } from "@/components/dashboard/dashboardStyles"
import { EmptyState } from "@/components/dashboard/delight/EmptyState"

const box = `p-4 ${dashCard}`

/** Calendar-style tile: month on a coloured band, big day number. */
function DateTile({ ms, tone, live }: { ms: number; tone: "teal" | "violet"; live?: boolean }) {
  const d = new Date(ms)
  const band = tone === "teal" ? "bg-teal-500" : "bg-violet-500"
  return (
    <span className="flex w-12 shrink-0 flex-col overflow-hidden rounded-xl border border-lp-line bg-lp-card text-center" aria-hidden="true">
      <span className={`py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${live ? "bg-red-500" : band}`}>
        {live ? "Live" : d.toLocaleDateString(undefined, { month: "short" })}
      </span>
      <span className="py-1 font-display text-lg font-semibold leading-none">{d.getDate()}</span>
    </span>
  )
}



/** What's coming up (appointment, booked live sessions) and the latest notifications. */
export function SidePanel({ appointment, now }: { appointment: Appointment | null; now: number }) {
  const [uid, setUid] = useState<string | null>(null)
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const notifications = useNotifications(uid)

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUid(u?.uid ?? null)
    if (u) fetchLiveSessions().then((list) => setSessions(list.filter((s) => s.purchased))).catch(() => {})
  }), [])

  const upcomingAppt = appointment && appointment.atMs > now ? appointment : null
  const recent = (notifications ?? []).slice(0, 3)

  return (
    <aside className="space-y-4">
      <section className={box}>
        <h2 className="mb-3 text-sm font-semibold">Coming up</h2>
        {!upcomingAppt && sessions.length === 0 ? (
          <EmptyState art="calendar" title="Nothing scheduled yet">
            <Link href="/dashboard/appointment" className="font-medium text-lp-azure hover:underline">Add your embassy appointment →</Link>
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {upcomingAppt && (
              <li>
                <Link href="/dashboard/appointment" className="flex items-center gap-3 rounded-xl p-2 hover:bg-lp-card-2">
                  <DateTile ms={upcomingAppt.atMs} tone="teal" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">Visa interview</span>
                    <span className="block truncate text-xs text-lp-muted">
                      {new Date(upcomingAppt.atMs).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} · {upcomingAppt.embassy}
                    </span>
                  </span>
                </Link>
              </li>
            )}
            {sessions.slice(0, 2).map((s) => (
              <li key={s.id}>
                <Link href={s.joinable ? `/live/${s.id}` : "/dashboard/live-sessions"} className="flex items-center gap-3 rounded-xl p-2 hover:bg-lp-card-2">
                  <DateTile ms={new Date(s.scheduledAt).getTime()} tone="violet" live={s.live} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{s.title}</span>
                    <span className="block text-xs text-lp-muted">{s.live ? "Live now · tap to join" : formatSessionTime(s.scheduledAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={box}>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Recent</h2>
          <Link href="/dashboard/notifications" className="text-xs font-medium text-lp-azure hover:underline">See all</Link>
        </div>
        {notifications === null ? (
          <p className="text-sm text-lp-muted">Loading…</p>
        ) : recent.length === 0 ? (
          <EmptyState art="bell" title="No notifications yet">
            <p className="text-lp-muted">Reminders and updates will show up here.</p>
          </EmptyState>
        ) : (
          <ul className="space-y-1">
            {recent.map((n) => (
              <li key={n.id}>
                <Link href={internalPath(n.url) ?? `/dashboard/notifications#${n.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-lp-card-2">
                  <CategoryIcon category={n.category} />
                  <span className="min-w-0">
                    <span className={`block truncate text-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</span>
                    <span className="block text-xs text-lp-muted">{timeAgo(n.createdAt, now)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
