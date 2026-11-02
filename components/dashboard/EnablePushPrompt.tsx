"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { BellRing, Loader2, Share, X } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { enablePush, getPushState, type PushState } from "@/lib/pushClient"

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
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted p-3">
        <div className="min-w-0 flex-1">{body}</div>
        {action}
        {state === "granted" && (
          <Button size="sm" variant="ghost" className="rounded-full" disabled={busy} onClick={enable}>Refresh this device</Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border border-lp-azure/30 bg-lp-sky p-5">
      <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-lp-azure" />
      <div className="min-w-0 flex-1 space-y-3">
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
