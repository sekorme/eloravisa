"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { CalendarClock, Video } from "lucide-react"
import { auth } from "@/firebase/client"
import type { Appointment } from "@/hooks/useReadiness"
import { fetchLiveSessions, formatSessionTime, type LiveSession } from "@/lib/liveSessions"
import { internalPath, timeAgo, useNotifications } from "@/lib/notificationsClient"
import { dashCard } from "@/components/dashboard/dashboardStyles"
import { EmptyState } from "@/components/dashboard/delight/EmptyState"

const box = `p-4 ${dashCard}`

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
                <Link href="/dashboard/appointment" className="flex gap-3 rounded-xl p-2 hover:bg-lp-card-2">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-lp-azure" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">Visa interview</span>
                    <span className="block truncate text-xs text-lp-muted">
                      {new Date(upcomingAppt.atMs).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {upcomingAppt.embassy}
                    </span>
                  </span>
                </Link>
              </li>
            )}
            {sessions.slice(0, 2).map((s) => (
              <li key={s.id}>
                <Link href={s.joinable ? `/live/${s.id}` : "/dashboard/live-sessions"} className="flex gap-3 rounded-xl p-2 hover:bg-lp-card-2">
                  <Video className="mt-0.5 h-4 w-4 shrink-0 text-lp-azure" />
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
                <Link href={internalPath(n.url) ?? `/dashboard/notifications#${n.id}`} className="block rounded-xl p-2 hover:bg-lp-card-2">
                  <span className={`block truncate text-sm ${n.read ? "" : "font-semibold"}`}>{n.title}</span>
                  <span className="block text-xs text-lp-muted">{timeAgo(n.createdAt, now)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
