"use client"

import { useEffect, useState } from "react"
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, writeBatch } from "firebase/firestore"
import { db } from "@/firebase/client"
import { categoryForType, type NotificationCategory } from "@/lib/notificationPrefs"

/**
 * In-app notifications (users/{uid}/notifications), written server-side by
 * notifyUser in both apps and by the admin broadcasts. Used by the bell and
 * the notifications page. Clients may only read, delete, and flip `read`
 * (firestore.rules).
 */

export interface AppNotification {
  id: string
  title: string
  body: string
  url: string | null
  type: string | null
  category: NotificationCategory
  read: boolean
  createdAt: Date | null
}

const SITE_HOSTS = new Set(["eloravisa.com", "www.eloravisa.com"])

/** In-app path for a notification link on our own site; null otherwise. */
export function internalPath(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith("/")) return url
  try {
    const u = new URL(url)
    return SITE_HOSTS.has(u.hostname) || u.hostname === window.location.hostname ? `${u.pathname}${u.search}${u.hash}` : null
  } catch {
    return null
  }
}

/** Button text for the notification's link, from where it points. */
export function actionLabel(n: AppNotification): string {
  const path = internalPath(n.url) ?? ""
  if (path.startsWith("/live/")) return "Join session"
  if (path.startsWith("/dashboard/appointment")) return "View appointment"
  if (path.startsWith("/dashboard/live-sessions")) return "Live sessions"
  if (path.startsWith("/dashboard/application")) return "My documents"
  if (path.startsWith("/dashboard/refusal")) return "Refusal recovery"
  if (path.startsWith("/dashboard/subscription")) return "Subscription"
  if (path.startsWith("/dashboard/settings")) return "Settings"
  if (path.startsWith("/affiliate")) return "Affiliate dashboard"
  return "Open"
}

function toDate(v: unknown): Date | null {
  if (!v) return null
  if (typeof (v as { toDate?: unknown }).toDate === "function") return (v as { toDate: () => Date }).toDate()
  const d = new Date(v as string)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Live notifications for a user, newest first, expired ones left out. */
export function useNotifications(uid: string | null) {
  const [items, setItems] = useState<AppNotification[] | null>(null)

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, `users/${uid}/notifications`), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => {
      const now = Date.now()
      setItems(
        snap.docs
          .map((d) => {
            const n = d.data()
            const expires = toDate(n.expiresAt)
            if (expires && expires.getTime() < now) return null
            const type = typeof n.type === "string" ? n.type : null
            return {
              id: d.id,
              title: n.title ?? "Notification",
              body: n.body ?? "",
              url: typeof n.url === "string" ? n.url : null,
              type,
              // Untyped notifications are admin announcements.
              category: categoryForType(type ?? "broadcast"),
              read: !!n.read,
              createdAt: toDate(n.createdAt),
            } satisfies AppNotification
          })
          .filter((n): n is AppNotification => n !== null),
      )
    })
  }, [uid])

  return items
}

const ref = (uid: string, id: string) => doc(db, `users/${uid}/notifications`, id)

export async function markRead(uid: string, ids: string[]) {
  // Batches of 400, under Firestore's 500-write limit.
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db)
    ids.slice(i, i + 400).forEach((id) => batch.update(ref(uid, id), { read: true }))
    await batch.commit()
  }
}

export async function removeNotifications(uid: string, ids: string[]) {
  if (ids.length === 1) return deleteDoc(ref(uid, ids[0]))
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db)
    ids.slice(i, i + 400).forEach((id) => batch.delete(ref(uid, id)))
    await batch.commit()
  }
}

/** "2 min ago", "3 h ago", then a date. */
export function timeAgo(d: Date | null, now = Date.now()): string {
  if (!d) return ""
  const mins = Math.round((now - d.getTime()) / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" })
}
