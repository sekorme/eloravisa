import { AlarmClock, Bell, CreditCard, FileText, Video, type LucideIcon } from "lucide-react"
import type { NotificationCategory } from "@/lib/notificationPrefs"

/** A coloured icon per notification category, shared by the bell, dashboard and notifications page. */
export const CATEGORY_ICON: Record<NotificationCategory, [LucideIcon, string]> = {
  reminders: [AlarmClock, "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300"],
  documents: [FileText, "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"],
  sessions: [Video, "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300"],
  updates: [Bell, "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"],
  account: [CreditCard, "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"],
}

export function CategoryIcon({ category, className = "h-8 w-8" }: { category: NotificationCategory; className?: string }) {
  const [Icon, tone] = CATEGORY_ICON[category]
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-xl ${tone} ${className}`} aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  )
}
