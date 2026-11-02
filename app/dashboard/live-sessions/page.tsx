"use client"

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { CalendarClock, Loader2, Users, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { auth } from '@/firebase/client'
import {
  fetchLiveSessions,
  formatSessionTime,
  purchaseAndConfirm,
  type LiveSession,
} from '@/lib/liveSessions'

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setSessions(await fetchLiveSessions())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions')
    }
  }, [])

  useEffect(() => {
    // Wait for Firebase to restore the session before calling the API.
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) load()
    })
    // The join window opens on a timer, so refresh the "Join" state.
    const interval = setInterval(() => {
      if (auth.currentUser) load()
    }, 60_000)
    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [load])

  const buy = async (meetingId: string) => {
    setBuying(meetingId)
    try {
      const updated = await purchaseAndConfirm(meetingId)
      if (updated) setSessions(updated)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment failed')
      load()
    } finally {
      setBuying(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <Video className="h-3.5 w-3.5 text-lp-azure" /> Live sessions
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">Live Sessions</h1>
        <p className="max-w-2xl text-lp-muted">
          Join live video sessions with the Elora team. Buy a seat, and the room opens 15 minutes before the start time.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-lp-line bg-lp-card p-6 text-sm text-lp-muted">
          {error}{' '}
          <button className="font-medium text-lp-azure underline" onClick={load}>Try again</button>
        </div>
      )}

      {!sessions && !error && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-lp-azure" />
        </div>
      )}

      {sessions?.length === 0 && (
        <div className="rounded-[1.75rem] border border-lp-line bg-lp-card p-10 text-center text-lp-muted">
          No sessions are scheduled right now. New ones will show up here.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {sessions?.map((s) => (
          <div key={s.id} className="flex flex-col rounded-[1.75rem] border border-lp-line bg-lp-card p-6 lp-shadow">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">{s.title}</h2>
              <span className="shrink-0 font-display text-2xl font-semibold tracking-[-0.04em]">${s.priceUsd}</span>
            </div>
            {s.description && <p className="mt-2 text-sm text-lp-muted">{s.description}</p>}
            <div className="mt-4 space-y-1.5 text-sm text-lp-muted">
              <p className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" /> {formatSessionTime(s.scheduledAt)} · with {s.hostName}
              </p>
              {s.seatsLeft !== null && (
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {s.seatsLeft === 0 ? 'Sold out' : `${s.seatsLeft} seat${s.seatsLeft === 1 ? '' : 's'} left`}
                </p>
              )}
            </div>
            <div className="mt-6 flex-1" />
            {s.joinable ? (
              <Button asChild className="w-full rounded-full">
                <Link href={`/live/${s.id}`}>Join session</Link>
              </Button>
            ) : s.purchased ? (
              <Button disabled variant="outline" className="w-full rounded-full">
                Seat booked · room opens 15 min before
              </Button>
            ) : s.purchasable ? (
              <Button className="w-full rounded-full" disabled={buying !== null} onClick={() => buy(s.id)}>
                {buying === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Buy a seat · $${s.priceUsd}`}
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full rounded-full">Sold out</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
