"use client"

import React, { useEffect, useMemo, useState } from "react"
import { format } from 'date-fns'
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"
import { db } from "@/firebase/client"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ChevronLeft, Download, Filter, Eye, Repeat, MoreVertical, TrendingUp, DollarSign, Clock } from "lucide-react"

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
  // some server code writes `createdAt` instead of `requestedAt`
  createdAt?: { seconds?: number } | string | number | Date | null
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

  // UI for viewing a withdrawal and repeating (copy details)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Close the open menu when clicking outside any menu element.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Walk up from the event target to check for a menu element with matching data-menu-id.
      let node = e.target as Node | null
      let found = false

      while (node && node instanceof HTMLElement) {
        const el = node as HTMLElement
        if (el.dataset && el.dataset.menuId && el.dataset.menuId === openMenuId) {
          found = true
          break
        }
        node = node.parentElement
      }

      if (!found) setOpenMenuId(null)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMenuId])

  useEffect(() => {
    let unsub: (() => void) | undefined
    let canceled = false

    async function init() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Try to fetch influencer data for settings/metadata, but don't block withdrawals fetching
        let id = user.uid
        try {
          const inf = await getInfluencerData(user.uid)
          if (inf) {
            const maybeUid = (inf as Record<string, unknown>)?.uid
            if (typeof maybeUid === 'string' && maybeUid.length) {
              id = maybeUid
            }
            setInfluencerId(id)
          } else {
            // still set influencerId to auth uid so we can query withdrawals
            setInfluencerId(user.uid)
          }
        } catch {
          // ignore influencer lookup errors and fallback to auth uid
          setInfluencerId(user.uid)
        }

        const wRef = collection(db, "withdrawals")
        // Query by influencerId only; sort client-side to avoid Firestore index issues
        const q = query(wRef, where("influencerId", "==", id))

        unsub = onSnapshot(
          q,
          (snap) => {
            if (canceled) return
            const items: Withdrawal[] = []
            snap.forEach((d) => items.push({ id: d.id, ...(d.data() as Withdrawal) }))
            // Sort by requestedAt/createdAt descending client-side
            // Sort by requestedAt/createdAt descending client-side
            const getMillisFromWithdrawal = (w: Withdrawal): number => {
              const raw = w.requestedAt ?? w.createdAt
              if (!raw) return 0
              if (typeof raw === 'number') return raw
              if (typeof raw === 'string') {
                const parsed = Date.parse(raw)
                return isNaN(parsed) ? 0 : parsed
              }
              if (raw instanceof Date) return raw.getTime()
              const maybe = raw as { seconds?: number }
              if (maybe && typeof maybe.seconds === 'number') return maybe.seconds * 1000
              return 0
            }
            items.sort((a, b) => getMillisFromWithdrawal(b) - getMillisFromWithdrawal(a))
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
    // Accept either requestedAt or createdAt shapes
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
      const timestamp = w.requestedAt ?? w.createdAt
      const req = makeDate(timestamp)
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

  const handleView = (w: Withdrawal) => setSelectedWithdrawal(w)

  const handleRepeat = async (w: Withdrawal) => {
    try {
      const payload = {
        amount: w.requestedAmount || 0,
        payoutMethod: w.payoutMethod || '',
        payoutInfo: w.payoutInfo || {},
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(JSON.stringify(payload))
        setCopyMessage('Details copied to clipboard — you can paste into a new request')
        setTimeout(() => setCopyMessage(null), 2500)
      } else {
        setCopyMessage('Copied — please paste manually')
        setTimeout(() => setCopyMessage(null), 2500)
      }
    } catch (err) {
      console.error('copy failed', err)
      setCopyMessage('Failed to copy')
      setTimeout(() => setCopyMessage(null), 2500)
    }
  }

  const toggleMenu = (id?: string) => {
    if (!id) return setOpenMenuId(null)
    setOpenMenuId((s) => (s === id ? null : id))
  }

  const downloadReceipt = (w: Withdrawal) => {
    try {
      const data = {
        id: w.id,
        requestedAt: makeDate(w.requestedAt ?? w.createdAt)?.toISOString() || null,
        amount: w.requestedAmount || 0,
        fees: { tax: w.taxAmount || 0, transfer: w.transferFee || 0, total: w.totalDeducted || 0 },
        payoutMethod: w.payoutMethod || null,
        payoutInfo: w.payoutInfo || null,
        status: w.status || null,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `withdrawal_${w.id || 'unknown'}.json`
      a.click()
      URL.revokeObjectURL(url)
      setOpenMenuId(null)
    } catch (err) {
      console.error('download failed', err)
    }
  }

  const contactSupport = (w: Withdrawal) => {
    const subject = encodeURIComponent(`Support request: Withdrawal ${w.id || ''}`)
    const body = encodeURIComponent(`Hello,%0A%0AI need help with withdrawal ${w.id || ''}.%0AAmount: ${w.requestedAmount || 0}%0AStatus: ${w.status || 'N/A'}%0A%0AThanks.`)
    window.location.href = `mailto:support@eloravisa.com?subject=${subject}&body=${body}`
    setOpenMenuId(null)
  }

  return (
    <div className="min-h-[70vh] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/affiliate/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronLeft className="w-4 h-4" /> Back
            </Link>
            <h2 className="text-2xl hidden md:block font-bold">Withdrawal Requests</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block mr-2">
              <Input placeholder="Search withdrawals..." value={queryText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQueryText(e.target.value)} className="w-56" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setFilterStatus("all")}>
              <Filter className="w-4 h-4" /> <span className="hidden md:inline">All</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCsv()}>
              <Download className="w-4 h-4" /> <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Requested */}
          <Card className="overflow-hidden stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm">
                  <DollarSign className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Requested</div>
                      <div className="text-2xl font-bold mt-1">${totals.totalRequested.toFixed(2)}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">+2.4%</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">Total requested from all withdrawals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Paid */}
          <Card className="overflow-hidden stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Paid</div>
                      <div className="text-2xl font-bold mt-1">${totals.totalPaid.toFixed(2)}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">This month</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">Amount paid out so far</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="overflow-hidden stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Pending</div>
                      <div className="text-2xl font-bold mt-1">{totals.pendingCount}</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Needs review</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">Pending requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          {/* Responsive header: stacks on small screens, inline on md+ */}
          <CardHeader className="requests-header flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle>Requests</CardTitle>

            <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto md:overflow-visible py-1 md:py-0">
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" className="flex-shrink-0" variant={filterStatus === "all" ? "secondary" : "ghost"} onClick={() => setFilterStatus("all")}>All</Button>
                <Button size="sm" className="flex-shrink-0" variant={filterStatus === "pending" ? "secondary" : "ghost"} onClick={() => setFilterStatus("pending")}>Pending</Button>
                <Button size="sm" className="flex-shrink-0" variant={filterStatus === "approved" ? "secondary" : "ghost"} onClick={() => setFilterStatus("approved")}>Approved</Button>
                <Button size="sm" className="flex-shrink-0" variant={filterStatus === "paid" ? "secondary" : "ghost"} onClick={() => setFilterStatus("paid")}>Paid</Button>
                <Button size="sm" className="flex-shrink-0" variant={filterStatus === "declined" ? "secondary" : "ghost"} onClick={() => setFilterStatus("declined")}>Declined</Button>
              </div>
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
                  <thead className="hidden md:table-header-group">
                    <tr className="text-sm text-muted-foreground text-left">
                      <th className="pb-2 pr-6 w-1/6">Requested</th>
                      <th className="pb-2 pr-6 w-1/12">Amount</th>
                      <th className="pb-2 pr-6 w-1/6">Fees</th>
                      <th className="pb-2 pr-6 w-1/12">Method</th>
                      <th className="pb-2 pr-6 w-1/12">Status</th>
                      <th className="pb-2 pr-6 w-1/6">Details</th>
                      <th className="pb-2 pr-2 w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">No matching requests.</td>
                      </tr>
                    ) : (
                      visible.map((w) => {
                        const timestamp = w.requestedAt ?? w.createdAt
                        const reqAt = makeDate(timestamp)
                        return (
                          <React.Fragment key={w.id}>
                            {/* Desktop row */}
                            <tr className="border-t hidden md:table-row align-top animate-row">
                              <td className="py-3 text-sm">{reqAt ? format(reqAt, 'EEE dd MMM yyyy') : '—'}</td>
                              <td className="py-3 text-sm font-semibold">${(w.requestedAmount || 0).toFixed(2)}</td>
                              <td className="py-3 text-sm max-w-xs truncate">Tax: ${(w.taxAmount || 0).toFixed(2)} • Fee: ${(w.transferFee || 0).toFixed(2)} • Total: ${(w.totalDeducted || 0).toFixed(2)}</td>
                              <td className="py-3 text-sm">{(w.payoutMethod || '—').toUpperCase()}</td>
                              <td className="py-3 text-sm">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${w.status === 'pending' ? 'bg-amber-100 text-amber-700' : w.status === 'paid' || w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{w.status ? w.status.toUpperCase() : 'PENDING'}</span>
                              </td>
                              <td className="py-3 text-sm max-w-[260px] truncate">
                                {w.payoutInfo ? (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {w.payoutInfo.paypalEmail ? `PayPal: ${w.payoutInfo.paypalEmail}` : ''}
                                    {w.payoutInfo.mobileNumber ? ` • Mobile: ${w.payoutInfo.mobileNumber}` : ''}
                                    {w.payoutInfo.bankName ? ` • ${w.payoutInfo.bankName} ${w.payoutInfo.bankAccountNumber ? `• ${w.payoutInfo.bankAccountNumber}` : ''}` : ''}
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="py-3 text-sm text-right">
                                <div className="flex items-center justify-end gap-2 relative">
                                  <Button onClick={() => handleView(w)} variant="ghost" size="sm" aria-label="View" title="View">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={() => handleRepeat(w)} variant="outline" size="sm" aria-label="Repeat" title="Repeat">
                                    <Repeat className="w-4 h-4" />
                                  </Button>

                                  <div className="relative" data-menu-id={w.id}>
                                    <Button onClick={() => toggleMenu(w.id)} variant="ghost" size="sm" aria-label="More" title="More">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                    {openMenuId === w.id && (
                                      <div className="absolute right-0 mt-2 w-44 bg-background border rounded-md shadow-lg z-50 py-1 animate-[fade-in_120ms_ease]" data-menu-id={w.id}>
                                        <button onClick={() => downloadReceipt(w)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50">Download receipt</button>
                                        <button onClick={() => contactSupport(w)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50">Contact support</button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Mobile card */}
                            <tr className="md:hidden">
                              <td colSpan={7} className="py-3">
                                <div className="p-3 border rounded-lg bg-card transition-transform transform hover:-translate-y-0.5 hover:shadow-lg overflow-hidden relative animate-card">
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${w.status === 'paid' || w.status === 'approved' ? 'bg-emerald-400/80' : w.status === 'pending' ? 'bg-amber-400/80' : 'bg-red-400/80'}`} />
                                  <div className="relative ml-2">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <div className="min-w-0">
                                            <div className="text-sm font-semibold truncate">{reqAt ? format(reqAt, 'EEE dd MMM yyyy') : '—'}</div>
                                            <div className="text-xs text-muted-foreground truncate">{(w.payoutMethod || '—').toUpperCase()} • {(w.status || 'pending').toUpperCase()}</div>
                                          </div>
                                          <div className="text-right ml-4">
                                            <div className="text-lg font-bold">${(w.requestedAmount || 0).toFixed(2)}</div>
                                            <div className="text-xs text-muted-foreground">Total: ${(w.totalDeducted || 0).toFixed(2)}</div>
                                          </div>
                                        </div>

                                        <div className="mt-3 text-xs text-muted-foreground break-words">
                                          {w.payoutInfo ? (
                                            <div className="space-y-1">
                                              {w.payoutInfo.paypalEmail ? <div className="truncate">PayPal: {w.payoutInfo.paypalEmail}</div> : null}
                                              {w.payoutInfo.mobileNumber ? <div className="truncate">Mobile: {w.payoutInfo.mobileNumber}</div> : null}
                                              {w.payoutInfo.bankName ? <div className="truncate">{w.payoutInfo.bankName} • {w.payoutInfo.bankAccountNumber}</div> : null}
                                            </div>
                                          ) : '—'}
                                        </div>
                                      </div>

                                      <div className="flex-shrink-0 flex flex-col items-end gap-2 ml-2">
                                        <div className="flex gap-2">
                                          <Button onClick={() => handleView(w)} variant="ghost" size="sm" aria-label="View" title="View">
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                          <Button onClick={() => handleRepeat(w)} variant="outline" size="sm" aria-label="Repeat" title="Repeat">
                                            <Repeat className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        <div className="relative">
                                          <Button onClick={() => toggleMenu(w.id)} variant="ghost" size="sm" aria-label="More" title="More">
                                            <MoreVertical className="w-4 h-4" />
                                          </Button>
                                          {openMenuId === w.id && (
                                            <div className="absolute right-0 mt-2 w-44 bg-background border rounded-md shadow-lg z-50 py-1" data-menu-id={w.id}>
                                              <button onClick={() => downloadReceipt(w)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50">Download receipt</button>
                                              <button onClick={() => contactSupport(w)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50">Contact support</button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
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

        {/* Lightweight modal for viewing details */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedWithdrawal(null)} />
            <div data-withdrawal-modal className="relative max-w-lg w-full bg-background rounded-lg shadow-lg p-6 z-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Withdrawal details</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedWithdrawal.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { handleRepeat(selectedWithdrawal); setSelectedWithdrawal(null) }}>Repeat</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedWithdrawal(null)}>Close</Button>
                </div>
              </div>

              <div className="mt-4 text-sm text-muted-foreground space-y-2">
                <div><strong>Requested:</strong> {makeDate(selectedWithdrawal.requestedAt ?? selectedWithdrawal.createdAt) ? format(makeDate(selectedWithdrawal.requestedAt ?? selectedWithdrawal.createdAt)!, 'EEE dd MMM yyyy p') : '—'}</div>
                <div><strong>Amount:</strong> ${(selectedWithdrawal.requestedAmount || 0).toFixed(2)}</div>
                <div><strong>Fees:</strong> Tax ${(selectedWithdrawal.taxAmount || 0).toFixed(2)} • Transfer ${(selectedWithdrawal.transferFee || 0).toFixed(2)} • Total ${(selectedWithdrawal.totalDeducted || 0).toFixed(2)}</div>
                <div><strong>Method:</strong> {(selectedWithdrawal.payoutMethod || '—').toUpperCase()}</div>
                <div><strong>Payout info:</strong>
                  <div className="mt-1 ml-2 text-xs text-muted-foreground break-words">
                    {selectedWithdrawal.payoutInfo ? JSON.stringify(selectedWithdrawal.payoutInfo, null, 2) : '—'}
                  </div>
                </div>
              </div>
              {copyMessage && <div className="mt-4 text-sm text-green-600">{copyMessage}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
