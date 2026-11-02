"use client"

import { useEffect, useMemo, useState } from "react"
import { useDashboardData } from "@/context/DashboardDataContext"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { computeReadiness, interviewScoresFrom, type ReviewFacts } from "@/lib/visaReadiness"

/** users/{uid}.appointment, written from the appointment page. */
export interface Appointment {
  /** ISO date-time. */
  at: string
  /** Same moment in ms, for the reminder cron's range query. */
  atMs: number
  embassy: string
  city: string
  address?: string
  notes?: string
  checklist?: Record<string, boolean>
  /** Set by the reminder cron; cleared when the date changes. */
  remindersSent?: Record<string, number>
}

/** Readiness from the live dashboard data (needs DashboardDataProvider). */
export function useReadiness() {
  const { userData, reviews, interviewSessions, loading } = useDashboardData()
  const appointment = (userData?.appointment as Appointment | undefined) ?? null
  // Ticks each minute so "expired" and countdowns stay current on an open tab.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const readiness = useMemo(() => {
    const requiredDocuments = getRequiredDocuments(userData?.onboarding?.visaType)
    return computeReadiness({
      requiredDocuments,
      uploadedKeys: Object.keys(userData?.documents ?? {}),
      reviews: reviews as ReviewFacts[],
      interviewScores: interviewScoresFrom(interviewSessions as { date?: unknown; feedback?: { overallScore?: number } }[]),
      appointmentAt: appointment?.atMs ?? null,
      now,
    })
  }, [userData, reviews, interviewSessions, appointment, now])

  return { readiness, appointment, userData, loading, now }
}
