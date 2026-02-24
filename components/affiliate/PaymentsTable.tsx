"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'

interface Payment {
  id?: string
  userId?: string
  email?: string
  planId?: string
  plan?: string
  createdAt?: number | { seconds?: number } | string
  paidAt?: string | number
  commissionAmount?: number
}

interface Props {
  payments: Payment[]
  loading?: boolean
}

const formatDate = (val?: number | { seconds?: number } | string | undefined) => {
  if (!val) return '—'
  if (typeof val === 'number') return new Date(val).toLocaleString()
  if (typeof val === 'string') {
    const parsed = Date.parse(val)
    return isNaN(parsed) ? val : new Date(parsed).toLocaleString()
  }
  const maybe = val as { seconds?: number }
  if (maybe && typeof maybe.seconds === 'number') return new Date(maybe.seconds * 1000).toLocaleString()
  return '—'
}

export default function PaymentsTable({ payments, loading }: Props) {
  return (
    <div className="p-1">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading payment history...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 border-b">
                <th className="py-4 px-6 text-left font-semibold">User</th>
                <th className="py-4 px-6 text-left font-semibold">Subscription</th>
                <th className="py-4 px-6 text-left font-semibold">Date</th>
                <th className="py-4 px-6 text-right font-semibold">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/50">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-base font-semibold text-muted-foreground">No referrals yet</p>
                        <p className="text-sm text-muted-foreground/70">Share your promo code to start earning 10% commission.</p>
                    </div>
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground truncate max-w-[180px]">
                            {p.email || 'Anonymous User'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                            ID: {p.userId?.slice(-8) || '—'}
                        </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {p.planId || p.plan || 'Standard'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                    {p.createdAt ? formatDate(p.createdAt) : (p.paidAt ? formatDate(p.paidAt as any) : '—')}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-sm font-black text-green-600 dark:text-green-400">
                        +${(p.commissionAmount || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
