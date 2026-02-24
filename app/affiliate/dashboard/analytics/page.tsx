"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, BarChart3, Trophy, DollarSign, Users, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"
import { db } from "@/firebase/client"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import MonthlyBarChart from "@/components/affiliate/MonthlyBarChart"

interface InfluencerData {
  uid: string
  fullName?: string
  referralCount?: number
  totalCommission?: number
}

interface Payment {
  id?: string
  userId?: string
  email?: string
  planId?: string
  plan?: string
  createdAt?: number | { seconds?: number } | string
  commissionAmount?: number
}

function isFsTimestamp(v: unknown): v is { seconds: number } {
  return typeof v === 'object' && v !== null && 'seconds' in (v as any) && typeof (v as any).seconds === 'number'
}

function toMillis(v: number | string | { seconds?: number } | undefined): number | null {
  if (!v) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const p = Date.parse(v)
    return isNaN(p) ? null : p
  }
  if (isFsTimestamp(v)) return v.seconds * 1000
  return null
}

export default function AffiliateAnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [influencerData, setInfluencerData] = useState<InfluencerData | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(false)

  useEffect(() => {
    async function loadInfluencer() {
      if (!user) return
      try {
        const data = await getInfluencerData(user.uid)
        if (!data) {
          router.push('/affiliate/signin')
          return
        }
        setInfluencerData(data as InfluencerData)
      } catch (e) {
        console.error(e)
        toast.error('Failed to load influencer')
      } finally {
        setLoading(false)
      }
    }
    loadInfluencer()
  }, [user, router])

  useEffect(() => {
    async function loadPayments() {
      if (!influencerData?.uid) return
      setLoadingPayments(true)
      try {
        const ref = collection(db, 'payments')
        const qy = query(ref, where('influencerId', '==', influencerData.uid), orderBy('createdAt', 'desc'))
        const snap = await getDocs(qy)
        const items: Payment[] = []
        snap.forEach(d => items.push({ id: d.id, ...(d.data() as any) }))
        setPayments(items)
      } catch (e) {
        console.error('load payments failed', e)
        toast.error('Failed to load analytics data')
      } finally {
        setLoadingPayments(false)
      }
    }
    loadPayments()
  }, [influencerData])

  const metrics = useMemo(() => {
    const now = Date.now()
    const last30 = now - 30 * 24 * 60 * 60 * 1000

    let totalEarn = 0
    let last30Earn = 0
    const monthlyRefCounts = new Array(12).fill(0)
    const monthlyEarn = new Array(12).fill(0)

    const byEmail: Record<string, { count: number, amount: number }> = {}

    for (const p of payments) {
      const amt = Number(p.commissionAmount || 0)
      const ts = toMillis(p.createdAt)
      totalEarn += amt
      if (ts && ts >= last30) last30Earn += amt

      if (ts) {
        const d = new Date(ts)
        const monthsDiff = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth())
        if (monthsDiff >= 0 && monthsDiff < 12) {
          monthlyRefCounts[11 - monthsDiff] += 1
          monthlyEarn[11 - monthsDiff] += amt
        }
      }

      const email = (p.email || 'unknown').toLowerCase()
      if (!byEmail[email]) byEmail[email] = { count: 0, amount: 0 }
      byEmail[email].count += 1
      byEmail[email].amount += amt
    }

    // best month by earnings
    let bestIdx = 0
    for (let i = 1; i < 12; i++) if (monthlyEarn[i] > monthlyEarn[bestIdx]) bestIdx = i

    return {
      totalEarn,
      last30Earn,
      monthlyRefCounts,
      monthlyEarn,
      bestMonthIndex: bestIdx,
      topReferrers: Object.entries(byEmail)
        .sort((a, b) => b[1].amount - a[1].amount)
        .slice(0, 5)
        .map(([email, v]) => ({ email, count: v.count, amount: v.amount })),
    }
  }, [payments])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!influencerData) return null

  const labels = ['11m','10m','9m','8m','7m','6m','5m','4m','3m','2m','1m','Now']

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Detailed performance metrics for your affiliate activity.</p>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Earned" value={`$${metrics.totalEarn.toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} accent="from-emerald-500/20 to-emerald-500/10" />
          <MetricCard title="Last 30 Days" value={`$${metrics.last30Earn.toFixed(2)}`} icon={<TrendingUp className="h-4 w-4" />} accent="from-blue-500/20 to-blue-500/10" />
          <MetricCard title="Total Referrals" value={`${influencerData.referralCount || 0}`} icon={<Users className="h-4 w-4" />} accent="from-purple-500/20 to-purple-500/10" />
          <MetricCard title="Best Month" value={labels[metrics.bestMonthIndex]} icon={<Trophy className="h-4 w-4" />} accent="from-amber-500/20 to-amber-500/10" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-full p-6 bg-card rounded-xl border shadow-sm flex flex-col">
            <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-widest">Monthly Referrals</h3>
            <div className="flex-1 min-h-[250px] flex items-end">
              <MonthlyBarChart data={metrics.monthlyRefCounts} labels={labels} />
            </div>
          </div>
          <div className="h-full p-6 bg-card rounded-xl border shadow-sm flex flex-col">
            <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-widest">Monthly Earnings ($)</h3>
            <div className="flex-1 min-h-[250px] flex items-end">
              <MonthlyBarChart data={metrics.monthlyEarn.map(v => Math.round(v))} labels={labels} />
            </div>
          </div>
        </div>

        {/* Top referrers table */}
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-base font-bold">Top Referred Customers</h3>
          </div>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 border-b">
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Referrals</th>
                  <th className="py-3 px-4 text-right">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/50 text-sm">
                {metrics.topReferrers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-muted-foreground">No data yet</td>
                  </tr>
                )}
                {metrics.topReferrers.map(r => (
                  <tr key={r.email} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium">{r.email}</td>
                    <td className="py-3 px-4">{r.count}</td>
                    <td className="py-3 px-4 text-right font-semibold">${r.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, accent }: { title: string, value: string | number, icon: React.ReactNode, accent?: string }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${accent || 'from-primary/20 to-primary/10'}`}></div>
      <div className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">{icon}</div>
      </div>
    </div>
  )
}
