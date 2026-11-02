/**
 * Notification preferences: which categories a user gets by email and by
 * push, stored at users/{uid}.notificationPrefs. In-app notifications (the
 * bell) are always written, so nothing is lost by turning a channel off.
 *
 * Pure data and functions. eloraadmin keeps an identical copy
 * (lib/notificationPrefs.ts there), used by every sender on that side.
 * Change both copies together.
 */

export type NotificationChannel = "email" | "push"
export type NotificationCategory = "reminders" | "documents" | "sessions" | "updates" | "account"

export interface CategoryInfo {
  id: NotificationCategory
  label: string
  description: string
  /** Transactional email that always goes out (receipts, refunds). */
  emailRequired?: boolean
}

export const NOTIFICATION_CATEGORIES: CategoryInfo[] = [
  { id: "reminders", label: "Reminders", description: "Your embassy appointment, and live sessions you've booked (including when they go live)." },
  { id: "documents", label: "Document alerts", description: "Documents that are expiring or out of date, and review decisions from our team." },
  { id: "sessions", label: "Live session news", description: "New live sessions and replays." },
  { id: "updates", label: "Tips and updates", description: "Follow-ups from our team, announcements and offers." },
  { id: "account", label: "Payments and bookings", description: "Receipts, booking confirmations and refunds.", emailRequired: true },
]

export type NotificationPrefs = Partial<Record<NotificationCategory, Partial<Record<NotificationChannel, boolean>>>>

/** Which category a notification `type` belongs to. Unknown types count as updates. */
export function categoryForType(type: string): NotificationCategory {
  if (type === "paid_meeting_booked" || type === "paid_meeting_refund") return "account"
  if (type.startsWith("appointment_reminder") || type.startsWith("paid_meeting_reminder") || type === "paid_meeting_live") return "reminders"
  if (type === "document_expiry" || type === "document_review") return "documents"
  if (type === "paid_meeting" || type === "paid_meeting_replay") return "sessions"
  return "updates"
}

/** Everything is on until the user turns it off. */
export function isAllowed(prefs: NotificationPrefs | null | undefined, type: string, channel: NotificationChannel): boolean {
  const category = categoryForType(type)
  if (channel === "email" && NOTIFICATION_CATEGORIES.find((c) => c.id === category)?.emailRequired) return true
  return prefs?.[category]?.[channel] !== false
}
