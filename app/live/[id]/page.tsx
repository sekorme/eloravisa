"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type Call,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import { Loader2 } from 'lucide-react'
import { auth } from '@/firebase/client'
import { fetchJoinCredentials, LiveSessionError } from '@/lib/liveSessions'

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

function Room({ onLeave }: { onLeave: () => void }) {
  const { useCallCallingState } = useCallStateHooks()
  const state = useCallCallingState()
  if (state !== CallingState.JOINED) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }
  return (
    <div className="flex h-screen flex-col bg-[#101213] p-4">
      <div className="min-h-0 flex-1">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>
      <div className="flex justify-center pt-3">
        <CallControls onLeave={onLeave} />
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
          tokenProvider: async () => (await fetchJoinCredentials(meetingId)).token,
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
          <Room onLeave={() => router.push('/dashboard/live-sessions')} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  )
}
