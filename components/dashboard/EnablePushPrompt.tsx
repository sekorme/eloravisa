"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { BellRing, Loader2, Share, X } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { enablePush, getPushState, type PushState } from "@/lib/pushClient"
import { dashCard } from "@/components/dashboard/dashboardStyles"

const DISMISS_KEY = "push-prompt-dismissed"

/**
 * Asks to turn on push from a tap, which phones require (lib/pushClient.ts).
 * `compact` is the settings-page version; the default is a dismissible
 * dashboard card shown only while the choice is still open.
 */
export function EnablePushPrompt({ compact = false }: { compact?: boolean }) {
  const [uid, setUid] = useState<string | null>(null)
  const [state, setState] = useState<PushState | null>(null)
  const [dismissed, setDismissed] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setState(getPushState())
    setDismissed(!compact && localStorage.getItem(DISMISS_KEY) === "1")
    return onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null))
  }, [compact])

  if (!uid || !state) return null
  // Dashboard card: only while there's something the user can do now.
  if (!compact && (dismissed || state === "granted" || state === "unsupported" || state === "denied")) return null

  const enable = async () => {
    setBusy(true)
    try {
      const result = await enablePush(uid)
      setState(result)
      if (result === "granted") toast.success("Notifications are on for this device")
      else if (result === "denied") toast.error("Notifications were blocked. You can allow them in your browser settings.")
    } catch (err) {
      console.error(err)
      toast.error("Couldn't turn on notifications. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const sendTest = async () => {
    const user = auth.currentUser
    if (!user) return
    setBusy(true)
    try {
      // Make sure this device's token is saved before testing it.
      await enablePush(user.uid)
      const res = await fetch("/api/notifications/test", { method: "POST", headers: { Authorization: `Bearer ${await user.getIdToken()}` } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Couldn't send the test")
      toast.success(data.devices > 1 ? `Test sent to your ${data.devices} devices. It should arrive in a few seconds.` : "Test sent. It should arrive in a few seconds.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the test")
    } finally {
      setBusy(false)
    }
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setDismissed(true)
  }

  const body =
    state === "ios-needs-install" ? (
      <p className="text-sm text-lp-muted">
        On iPhone, notifications only work once Elora Visa is on your Home Screen: tap <Share className="inline h-3.5 w-3.5" aria-label="Share" /> Share, then <strong>Add to Home Screen</strong>, and open it from there.
      </p>
    ) : state === "denied" ? (
      <p className="text-sm text-lp-muted">Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then come back here.</p>
    ) : state === "unsupported" ? (
      <p className="text-sm text-lp-muted">This browser doesn&apos;t support notifications. Try Chrome on Android or a desktop browser.</p>
    ) : state === "granted" ? (
      <p className="text-sm text-emerald-700 dark:text-emerald-400">Notifications are on for this device.</p>
    ) : (
      <p className="text-sm text-lp-muted">Get appointment reminders, document alerts and live session updates on this device.</p>
    )

  const action = state === "default" && (
    <Button size="sm" className="rounded-full" disabled={busy} onClick={enable}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn on notifications"}
    </Button>
  )

  if (compact) {
    const status =
      state === "granted" ? { label: "On", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300" }
      : state === "denied" ? { label: "Blocked", tone: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-300" }
      : state === "default" ? { label: "Off", tone: "bg-muted text-muted-foreground" }
      : { label: "Not available", tone: "bg-muted text-muted-foreground" }
    return (
      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-medium"><BellRing className="h-4 w-4 text-primary" /> Push notifications on this device</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.tone}`}>{status.label}</span>
        </div>
        {body}
        <div className="flex flex-wrap gap-2">
          {action}
          {state === "granted" && (
            <>
              <Button size="sm" className="rounded-full" disabled={busy} onClick={sendTest}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send a test notification"}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-full" disabled={busy} onClick={enable}>Re-register this device</Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Each phone or browser is set up separately. Turn this on on every device where you want notifications.</p>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-3 border-l-4 border-l-lp-azure p-4 ${dashCard}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lp-sky"><BellRing className="h-4 w-4 text-lp-azure" /></span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-medium">Don&apos;t miss your reminders</p>
        {body}
        {action}
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="rounded p-1 text-lp-muted hover:bg-lp-card">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
