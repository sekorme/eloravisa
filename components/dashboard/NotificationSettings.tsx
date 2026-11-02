"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { Bell, Lock, Mail, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { EnablePushPrompt } from "@/components/dashboard/EnablePushPrompt"
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationPrefs,
} from "@/lib/notificationPrefs"

/**
 * Per-category email and push choices, saved to users/{uid}.notificationPrefs
 * and honoured by every sender (lib/notificationPrefs.ts). Linked from the
 * footer of every email as /dashboard/settings#notifications.
 */
export function NotificationSettings() {
  const [uid, setUid] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<NotificationPrefs>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let unsubDoc: (() => void) | undefined
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubDoc?.()
      setUid(user?.uid ?? null)
      if (!user) return
      unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
        setPrefs((snap.get("notificationPrefs") as NotificationPrefs) ?? {})
        setLoaded(true)
      })
    })
    return () => {
      unsubAuth()
      unsubDoc?.()
    }
  }, [])

  const isOn = (category: NotificationCategory, channel: NotificationChannel) => prefs[category]?.[channel] !== false

  const save = async (updates: Record<string, boolean>, message?: string) => {
    if (!uid) return
    try {
      await updateDoc(doc(db, "users", uid), updates)
      if (message) toast.success(message)
    } catch {
      toast.error("Couldn't save your notification settings")
    }
  }

  const toggle = (category: NotificationCategory, channel: NotificationChannel, value: boolean) =>
    save({ [`notificationPrefs.${category}.${channel}`]: value })

  const setAllEmail = (value: boolean) =>
    save(
      Object.fromEntries(
        NOTIFICATION_CATEGORIES.filter((c) => !c.emailRequired).map((c) => [`notificationPrefs.${c.id}.email`, value]),
      ),
      value ? "All emails turned on" : "Emails turned off. You'll still get payment receipts and booking confirmations.",
    )

  return (
    <Card id="notifications" className="scroll-mt-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" /> Notifications
        </CardTitle>
        <CardDescription>
          Choose how we reach you for each kind of update. Everything still appears in your notification bell, whatever you choose here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!loaded ? (
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="w-20 pb-2 text-center font-medium">
                      <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" /> Email</span>
                    </th>
                    <th className="w-20 pb-2 text-center font-medium">
                      <span className="inline-flex items-center gap-1"><Smartphone className="h-4 w-4" /> Push</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {NOTIFICATION_CATEGORIES.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </td>
                      <td className="py-3 text-center">
                        {c.emailRequired ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Receipts and booking confirmations are always emailed">
                            <Lock className="h-3.5 w-3.5" /> Always
                          </span>
                        ) : (
                          <Switch
                            checked={isOn(c.id, "email")}
                            onCheckedChange={(v) => toggle(c.id, "email", v)}
                            aria-label={`${c.label} by email`}
                          />
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <Switch
                          checked={isOn(c.id, "push")}
                          onCheckedChange={(v) => toggle(c.id, "push", v)}
                          aria-label={`${c.label} by push notification`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Per-device: turning push on here only covers this phone or browser. */}
            <EnablePushPrompt compact />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setAllEmail(false)}>Turn off all optional emails</Button>
              <Button variant="ghost" size="sm" onClick={() => setAllEmail(true)}>Turn all emails on</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
