"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { CalendarClock, Radio, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { auth } from '@/firebase/client'
import { fetchLiveSessions, formatSessionTime, purchaseAndConfirm, type LiveSession } from '@/lib/liveSessions'

const REFRESH_MS = 60_000
// "new" keeps the original key so earlier dismissals still count.
const dismissedKey = (id: string, kind: 'new' | 'live') =>
  kind === 'new' ? `live-session-dismissed:${id}` : `live-session-live-dismissed:${id}`

/**
 * Tells a buyer their session has gone live, or else announces a paid live
 * session the user hasn't bought. Each is shown once per session per browser;
 * the Live Sessions page lists them all.
 */
export default function LiveSessionPopup() {
  const pathname = usePathname()
  const [session, setSession] = useState<LiveSession | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    const load = async () => {
      try {
        const sessions = await fetchLiveSessions()
        // A session the user holds a seat for going live beats a sales pitch.
        const live = sessions.find((s) => s.joinable && s.live && !localStorage.getItem(dismissedKey(s.id, 'live')))
        const next = live ?? sessions.find((s) => s.purchasable && !localStorage.getItem(dismissedKey(s.id, 'new')))
        if (next) {
          setSession(next)
          setOpen(true)
        }
      } catch {
        // Non-essential: the Live Sessions page shows its own errors.
      }
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      clearInterval(interval)
      if (!user) return
      load()
      // Poll so a buyer already on the dashboard sees the host go live.
      interval = setInterval(load, REFRESH_MS)
    })
    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [])

  if (!session || pathname?.startsWith('/dashboard/live-sessions')) return null

  const isLive = session.joinable && session.live
  const close = () => {
    localStorage.setItem(dismissedKey(session.id, isLive ? 'live' : 'new'), '1')
    setOpen(false)
  }

  const buy = async () => {
    // Close first: the modal dialog blocks pointer events outside itself,
    // which would include Paystack's checkout iframe.
    close()
    try {
      await purchaseAndConfirm(session.id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="rounded-[1.75rem] border-lp-line bg-lp-card text-lp-fg">
        <DialogHeader>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-lp-sky px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">
            {isLive ? (
              <>
                <Radio className="h-3.5 w-3.5 animate-pulse text-red-500" /> Live now
              </>
            ) : (
              <>
                <Video className="h-3.5 w-3.5" /> New live session
              </>
            )}
          </span>
          <DialogTitle className="font-display text-2xl tracking-[-0.03em]">{session.title}</DialogTitle>
          {session.description && <DialogDescription>{session.description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-1.5 text-sm text-lp-muted">
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" /> {formatSessionTime(session.scheduledAt)} · with {session.hostName}
          </p>
          {isLive && <p>The host has started. Your seat is waiting.</p>}
          {!isLive && session.seatsLeft !== null && <p>{session.seatsLeft} seat{session.seatsLeft === 1 ? '' : 's'} left</p>}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button asChild variant="ghost" className="rounded-full" onClick={close}>
            <Link href="/dashboard/live-sessions">See all sessions</Link>
          </Button>
          {isLive ? (
            <Button asChild className="rounded-full" onClick={close}>
              <Link href={`/live/${session.id}`}>Join now</Link>
            </Button>
          ) : (
            <Button className="rounded-full" onClick={buy}>
              Buy a seat · ${session.priceUsd}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
