"use client"

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { onAuthStateChanged } from 'firebase/auth'
import { CalendarClock, CalendarPlus, Loader2, PlayCircle, Tag, Users, Video } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { auth } from '@/firebase/client'
import {
  downloadSessionIcs,
  fetchReplays,
  fetchSessionsWithPast,
  formatSessionTime,
  purchaseAndConfirm,
  quoteSeat,
  type LiveSession,
  type PastSession,
  type SeatQuote,
} from '@/lib/liveSessions'

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[] | null>(null)
  const [past, setPast] = useState<PastSession[]>([])
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchSessionsWithPast()
      setSessions(data.meetings)
      setPast(data.past)
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

  const buy = async (meetingId: string, code: string | null) => {
    setBuying(meetingId)
    try {
      const updated = await purchaseAndConfirm(meetingId, code)
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
          <SessionCard key={s.id} session={s} buying={buying} onBuy={buy} />
        ))}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Your past sessions</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {past.map((p) => (
              <PastSessionRow key={p.id} session={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SessionCard({
  session: s,
  buying,
  onBuy,
}: {
  session: LiveSession
  buying: string | null
  onBuy: (id: string, code: string | null) => void
}) {
  const [codeOpen, setCodeOpen] = useState(false)
  const [code, setCode] = useState('')
  const [quote, setQuote] = useState<SeatQuote | null>(null)
  const [checking, setChecking] = useState(false)

  const price = quote?.priceUsd ?? s.priceUsd
  const earlyBird = s.priceUsd < s.listPriceUsd

  const applyCode = async () => {
    if (!code.trim()) return
    setChecking(true)
    try {
      const q = await quoteSeat(s.id, code)
      setQuote(q)
      toast.success(`${q.percentOff}% off applied`)
    } catch (e) {
      setQuote(null)
      toast.error(e instanceof Error ? e.message : "That code isn't valid")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col rounded-[1.75rem] border border-lp-line bg-lp-card p-6 lp-shadow">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">{s.title}</h2>
        <span className="shrink-0 text-right">
          {(earlyBird || quote) && !s.purchased && (
            <span className="mr-1.5 text-sm text-lp-muted line-through">${s.listPriceUsd}</span>
          )}
          <span className="font-display text-2xl font-semibold tracking-[-0.04em]">${price}</span>
        </span>
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
        {earlyBird && s.earlyBirdEndsAt && !s.purchased && (
          <p className="flex items-center gap-2 font-medium text-lp-azure">
            <Tag className="h-4 w-4" /> Early-bird price until {formatSessionTime(s.earlyBirdEndsAt)}
          </p>
        )}
      </div>
      <div className="mt-6 flex-1" />

      {s.purchasable && (
        <div className="mb-3 text-sm">
          {!codeOpen ? (
            <button className="text-lp-azure underline" onClick={() => setCodeOpen(true)}>Have a discount code?</button>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setQuote(null) }}
                placeholder="CODE"
                aria-label="Discount code"
                className="h-9 min-w-0 flex-1 rounded-full border border-lp-line bg-transparent px-4 font-mono text-sm"
              />
              <Button variant="outline" className="rounded-full" disabled={checking || !code.trim()} onClick={applyCode}>
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          )}
        </div>
      )}

      {s.joinable ? (
        <Button asChild className="w-full rounded-full">
          <Link href={`/live/${s.id}`}>Join session</Link>
        </Button>
      ) : s.purchased ? (
        <div className="flex gap-2">
          <Button disabled variant="outline" className="flex-1 rounded-full">
            Seat booked · room opens 15 min before
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => downloadSessionIcs(s)} aria-label="Add to calendar">
            <CalendarPlus className="h-4 w-4" />
          </Button>
        </div>
      ) : s.purchasable ? (
        <Button className="w-full rounded-full" disabled={buying !== null} onClick={() => onBuy(s.id, quote?.discountCode ?? null)}>
          {buying === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Buy a seat · $${price}`}
        </Button>
      ) : (
        <Button disabled variant="outline" className="w-full rounded-full">Sold out</Button>
      )}
    </div>
  )
}

function PastSessionRow({ session }: { session: PastSession }) {
  const [loading, setLoading] = useState(false)

  const watch = async () => {
    setLoading(true)
    try {
      const recordings = await fetchReplays(session.id)
      if (recordings.length === 0) {
        toast.info("The replay isn't ready yet. Recordings can take a little while after the session ends.")
        return
      }
      // A session restarted mid-way has several parts; open the first and
      // offer the rest.
      window.open(recordings[0].url, '_blank', 'noopener')
      if (recordings.length > 1) toast.info(`This replay has ${recordings.length} parts. Opened part 1.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load the replay")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-lp-line bg-lp-card p-4">
      <div className="min-w-0">
        <p className="truncate font-medium">{session.title}</p>
        <p className="text-sm text-lp-muted">
          {formatSessionTime(session.scheduledAt)} · {session.attended ? 'You attended' : 'You missed this one'}
        </p>
      </div>
      <Button variant="outline" className="shrink-0 rounded-full" disabled={loading} onClick={watch}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlayCircle className="mr-1.5 h-4 w-4" /> Replay</>}
      </Button>
    </div>
  )
}
