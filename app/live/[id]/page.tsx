"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import {
  CallingState,
  CancelCallButton,
  ReactionsButton,
  ScreenShareButton,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type Call,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import { Loader2, MessageCircleQuestion } from 'lucide-react'
import { auth } from '@/firebase/client'
import { fetchJoinCredentials, LiveSessionError } from '@/lib/liveSessions'
import SessionQA from '@/components/live/SessionQA'

function Screen({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-lp-page px-6 text-center text-lp-fg">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
      {children}
      <Link href="/dashboard/live-sessions" className="text-sm font-medium text-lp-azure underline">
        Back to Live Sessions
      </Link>
    </div>
  )
}

function Room({ meetingId, onLeave }: { meetingId: string; onLeave: () => void }) {
  const { useCallCallingState } = useCallStateHooks()
  const state = useCallCallingState()
  const [qaOpen, setQaOpen] = useState(false)
  if (state !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }
  return (
    <div className="flex h-screen flex-col bg-[#101213] p-4">
      <div className="relative flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>
        {qaOpen && (
          <div className="absolute inset-y-0 right-0 z-20 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:static sm:ml-3 sm:w-[320px]">
            <SessionQA meetingId={meetingId} onClose={() => setQaOpen(false)} />
          </div>
        )}
      </div>
      {/* Audience controls: no record button (the host records), and
          reactions include raise hand. */}
      <div className="str-video__call-controls flex flex-wrap justify-center gap-2 pt-3">
        <ToggleAudioPublishingButton />
        <ToggleVideoPublishingButton />
        <ReactionsButton />
        <ScreenShareButton />
        <button
          onClick={() => setQaOpen((o) => !o)}
          aria-label="Questions for the host"
          aria-pressed={qaOpen}
          className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm text-white ${qaOpen ? 'bg-sky-600' : 'bg-[#19232d] hover:bg-[#4c535b]'}`}
        >
          <MessageCircleQuestion className="h-5 w-5" /> Q&amp;A
        </button>
        <CancelCallButton onLeave={onLeave} />
      </div>
    </div>
  )
}

/**
 * Room for a paid live session. /api/meetings/[id]/join checks the seat and
 * the join window, and returns a Stream token valid for this call only.
 */
export default function LiveSessionRoomPage() {
  const params = useParams()
  const router = useRouter()
  const meetingId = typeof params?.id === 'string' ? params.id : ''

  const [client, setClient] = useState<StreamVideoClient>()
  const [call, setCall] = useState<Call>()
  const [error, setError] = useState<{ status: number; message: string } | null>(null)
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    if (!meetingId) return
    let active = true
    let c: StreamVideoClient | undefined
    let joined: Call | undefined

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSignedOut(true)
        return
      }
      if (c) return
      try {
        const creds = await fetchJoinCredentials(meetingId)
        if (!active) return
        c = new StreamVideoClient({
          apiKey: creds.apiKey,
          user: creds.user,
          token: creds.token,
          // Re-checks the seat each time the token needs renewing.
          tokenProvider: async () => (await fetchJoinCredentials(meetingId, true)).token,
        })
        joined = c.call(creds.callType, creds.callId)
        await joined.join()
        if (!active) return
        setClient(c)
        setCall(joined)
      } catch (e) {
        if (!active) return
        setError(
          e instanceof LiveSessionError
            ? { status: e.status, message: e.message }
            : { status: 500, message: e instanceof Error ? e.message : "Couldn't connect to the session" },
        )
      }
    })

    return () => {
      active = false
      unsub()
      joined?.leave().catch(() => {})
      c?.disconnectUser().catch(() => {})
    }
  }, [meetingId])

  if (signedOut) {
    return (
      <Screen title="Sign in required">
        <p className="text-lp-muted">Sign in with the account you bought your seat with.</p>
      </Screen>
    )
  }
  if (error) {
    const title =
      error.status === 425 ? "The room isn't open yet"
      : error.status === 410 ? 'This session has ended'
      : error.status === 403 ? 'You need a seat for this session'
      : "Couldn't join the session"
    const detail =
      error.status === 425 ? 'The room opens 15 minutes before the start time.' : error.message
    return (
      <Screen title={title}>
        <p className="text-lp-muted">{detail}</p>
      </Screen>
    )
  }
  if (!client || !call) {
    return (
      <Screen title="Connecting to the session…">
        <Loader2 className="h-8 w-8 animate-spin text-lp-azure" />
      </Screen>
    )
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <Room meetingId={meetingId} onLeave={() => router.push('/dashboard/live-sessions')} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  )
}
