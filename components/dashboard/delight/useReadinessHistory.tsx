"use client"

import { useEffect, useMemo } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/client"
import { useReadiness } from "@/hooks/useReadiness"

/**
 * Daily readiness snapshots for the trend line: users/{uid}.readinessHistory
 * maps YYYY-MM-DD to that day's score. Written from the dashboard at most
 * once per day (and again only if the score changed), last 45 days kept.
 */
const KEEP_DAYS = 45

const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export function useReadinessHistory() {
  const { readiness, userData, loading, now } = useReadiness()
  const history = useMemo(() => (userData?.readinessHistory ?? {}) as Record<string, number>, [userData])
  const score = readiness.score
  const today = dayKey(now)

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (loading || !uid || history[today] === score) return
    const keys = Object.keys(history).sort()
    const stale = keys.slice(0, Math.max(0, keys.length + 1 - KEEP_DAYS))
    // Rewrite the map only when pruning; otherwise set today's entry.
    const update = stale.length
      ? { readinessHistory: Object.fromEntries([...keys.filter((k) => !stale.includes(k)).map((k) => [k, history[k]]), [today, score]]) }
      : { [`readinessHistory.${today}`]: score }
    updateDoc(doc(db, "users", uid), update).catch(() => {})
  }, [loading, history, today, score])

  // Oldest first, with today's live score last.
  const points = useMemo(() => {
    const entries = Object.entries({ ...history, [today]: score }).sort(([a], [b]) => a.localeCompare(b))
    return entries.slice(-30).map(([date, value]) => ({ date, value }))
  }, [history, today, score])

  const weekAgo = dayKey(now - 7 * 86_400_000)
  const baseline = points.find((p) => p.date >= weekAgo)?.value ?? points[0]?.value ?? score
  return { points, change: score - baseline, hasTrend: points.length >= 2 }
}

/** Tiny line chart of the last 30 snapshots. */
export function Sparkline({ points, className }: { points: { date: string; value: number }[]; className?: string }) {
  if (points.length < 2) return null
  const w = 120
  const h = 32
  const xs = points.map((_, i) => (i / (points.length - 1)) * w)
  const ys = points.map((p) => h - 2 - (p.value / 100) * (h - 4))
  const d = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label={`Readiness over the last ${points.length} days, from ${points[0].value} to ${points[points.length - 1].value}`}>
      <path d={`${d} L${w} ${h} L0 ${h} Z`} fill="currentColor" opacity="0.12" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill="currentColor" />
    </svg>
  )
}
