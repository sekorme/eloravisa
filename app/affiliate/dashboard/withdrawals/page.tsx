"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"
import { db } from "@/firebase/client"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ChevronLeft, Download, Filter } from "lucide-react"

type Withdrawal = {
  id?: string
  influencerId?: string
  influencerName?: string | null
  requestedAmount?: number
  taxAmount?: number
  transferFee?: number
  totalDeducted?: number
  payoutMethod?: string
  payoutInfo?: Record<string, string> | null
  status?: string
  requestedAt?: { seconds?: number } | string | number | Date | null
}

export default function WithdrawalsPage() {
  const { user } = useAuth()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [influencerId, setInfluencerId] = useState<string | null>(null)

  // UI state
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [queryText, setQueryText] = useState("")
  const [visibleCount, setVisibleCount] = useState<number>(20)

  useEffect(() => {
    let unsub: (() => void) | undefined
    let canceled = false

    async function init() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const inf = await getInfluencerData(user.uid)
        if (!inf) {
          setInfluencerId(null)
          setWithdrawals([])
          setLoading(false)
          return
        }

        const id = (inf as { uid: string }).uid
        setInfluencerId(id)

        const wRef = collection(db, "withdrawals")
        const q = query(wRef, where("influencerId", "==", id), orderBy("requestedAt", "desc"))

        unsub = onSnapshot(
          q,
          (snap) => {
            if (canceled) return
            const items: Withdrawal[] = []
            snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Withdrawal) }))
            setWithdrawals(items)
            setLoading(false)
          },
          (err) => {
            console.error("withdrawals snapshot error", err)
            setLoading(false)
          },
        )
      } catch (err) {
        console.error("Error loading withdrawals page:", err)
        setLoading(false)
      }
    }

    init()

    return () => {
      canceled = true
      if (unsub) unsub()
    }
  }, [user])

  const makeDate = (val: unknown): Date | null => {
    if (!val) return null
    if (typeof val === "number") return new Date(val)
    if (typeof val === "string") return new Date(val)
    if (val instanceof Date) return val
    const maybe = val as { seconds?: number }
    if (maybe && typeof maybe.seconds === "number") return new Date(maybe.seconds * 1000)
    return null
  }

  const totals = useMemo(() => {
    const totalRequested = withdrawals.reduce((s, w) => s + (w.requestedAmount || 0), 0)
    const totalPaid = withdrawals.reduce((s, w) => s + ((w.status === "paid" || w.status === "approved") ? (w.totalDeducted || 0) : 0), 0)
    const pendingCount = withdrawals.filter((w) => w.status === "pending").length
    return { totalRequested, totalPaid, pendingCount }
  }, [withdrawals])

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase()
    return withdrawals.filter((w) => {
      if (filterStatus !== "all" && (w.status || "pending") !== filterStatus) return false
      if (!q) return true
      const payoutInfo = w.payoutInfo || {}
      const joined = [w.payoutMethod, payoutInfo.paypalEmail, payoutInfo.mobileNumber, payoutInfo.bankAccountNumber, payoutInfo.bankName, w.requestedAmount]
        .filter(Boolean)
        .join(" ")
        .toString()
        .toLowerCase()
      return joined.includes(q)
    })
  }, [withdrawals, filterStatus, queryText])

  const visible = filtered.slice(0, visibleCount)

  const exportCsv = () => {
    const rows = [
      ["requestedAt", "requestedAmount", "taxAmount", "transferFee", "totalDeducted", "payoutMethod", "status", "payoutDetails"],
    ]
    filtered.forEach((w) => {
      const req = makeDate(w.requestedAt)
      const details = w.payoutInfo ? JSON.stringify(w.payoutInfo) : ""
      rows.push([
        req ? req.toISOString() : "",
        (w.requestedAmount || 0).toFixed(2),
        (w.taxAmount || 0).toFixed(2),
        (w.transferFee || 0).toFixed(2),
        (w.totalDeducted || 0).toFixed(2),
        w.payoutMethod || "",
        w.status || "",
        details,
      ])
    })

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `withdrawals_${influencerId || "me"}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-[70vh] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/affiliate/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronLeft className="w-4 h-4" /> Back
            </Link>
            <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Search payouts..." value={queryText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQueryText(e.target.value)} className="w-[260px]" />
            <Button variant="outline" onClick={() => setFilterStatus("all")}>
              <Filter className="mr-2 w-4 h-4" /> All
            </Button>
            <Button variant="outline" onClick={() => exportCsv()}>
              <Download className="mr-2 w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Requested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.totalRequested.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total requested from all withdrawals</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.totalPaid.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Amount paid out so far</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending requests</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant={filterStatus === "all" ? "secondary" : "ghost"} onClick={() => setFilterStatus("all")}>All</Button>
              <Button variant={filterStatus === "pending" ? "secondary" : "ghost"} onClick={() => setFilterStatus("pending")}>Pending</Button>
              <Button variant={filterStatus === "approved" ? "secondary" : "ghost"} onClick={() => setFilterStatus("approved")}>Approved</Button>
              <Button variant={filterStatus === "paid" ? "secondary" : "ghost"} onClick={() => setFilterStatus("paid")}>Paid</Button>
              <Button variant={filterStatus === "declined" ? "secondary" : "ghost"} onClick={() => setFilterStatus("declined")}>Declined</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="text-sm text-muted-foreground text-left">
                      <th className="pb-2 pr-6 w-1/6">Requested</th>
                      <th className="pb-2 pr-6 w-1/6">Amount</th>
                      <th className="pb-2 pr-6 w-1/6">Fees</th>
                      <th className="pb-2 pr-6 w-1/6">Method</th>
                      <th className="pb-2 pr-6 w-1/6">Status</th>
                      <th className="pb-2 pr-6 w-1/6">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No matching requests.</td>
                      </tr>
                    ) : (
                      visible.map((w) => {
                        const reqAt = makeDate(w.requestedAt)
                        return (
                          <tr key={w.id} className="border-t">
                            <td className="py-3 text-sm">{reqAt ? reqAt.toLocaleString() : '—'}</td>
                            <td className="py-3 text-sm">${(w.requestedAmount || 0).toFixed(2)}</td>
                            <td className="py-3 text-sm">Tax: ${(w.taxAmount || 0).toFixed(2)} • Fee: ${(w.transferFee || 0).toFixed(2)} • Total: ${(w.totalDeducted || 0).toFixed(2)}</td>
                            <td className="py-3 text-sm">{(w.payoutMethod || '—').toUpperCase()}</td>
                            <td className="py-3 text-sm">
                              <span className={`${w.status === 'pending' ? 'text-amber-600' : w.status === 'paid' || w.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{w.status || 'pending'}</span>
                            </td>
                            <td className="py-3 text-sm">
                              {w.payoutInfo ? (
                                <div className="text-xs text-muted-foreground">
                                  {w.payoutInfo.paypalEmail ? `PayPal: ${w.payoutInfo.paypalEmail}` : ''}
                                  {w.payoutInfo.mobileNumber ? `Mobile: ${w.payoutInfo.mobileNumber}` : ''}
                                  {w.payoutInfo.bankName ? `${w.payoutInfo.bankName} • ${w.payoutInfo.bankAccountNumber}` : ''}
                                </div>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>

                {filtered.length > visibleCount && (
                  <div className="py-4 flex justify-center">
                    <Button onClick={() => setVisibleCount((v) => v + 20)}>Load more</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
