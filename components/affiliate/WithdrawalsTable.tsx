"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Withdrawal {
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

interface Props {
  withdrawals: Withdrawal[]
  loading?: boolean
}

const toDate = (val: unknown): Date | null => {
  if (!val) return null
  if (typeof val === 'number') return new Date(val)
  if (typeof val === 'string') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }
  if (val instanceof Date) return val
  const maybe = val as { seconds?: number }
  if (maybe && typeof maybe.seconds === 'number') return new Date(maybe.seconds * 1000)
  return null
}

const formatDateParts = (val: unknown): { date: string; time: string } => {
  const d = toDate(val)
  if (!d) return { date: '—', time: '' }
  return { date: format(d, 'PPP'), time: format(d, 'p') }
}

export default function WithdrawalsTable({ withdrawals, loading }: Props) {
  return (
    <div className="p-1">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading withdrawal history...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/30 border-b">
                <th className="py-4 px-6 text-left font-semibold">Date</th>
                <th className="py-4 px-6 text-left font-semibold">Amount</th>
                <th className="py-4 px-6 text-left font-semibold">Method</th>
                <th className="py-4 px-6 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/50 text-sm">
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <p className="text-sm text-muted-foreground italic">No withdrawal requests found.</p>
                  </td>
                </tr>
              )}
              {withdrawals.map(w => {
                // Support both `requestedAt` and `createdAt` timestamps (some APIs write `createdAt`)
                const timestamp = (w as any).requestedAt ?? (w as any).createdAt
                const parts = formatDateParts(timestamp)
                return (
                <tr key={w.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{parts.date}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{parts.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground">${(w.requestedAmount || 0).toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground">Total: ${(w.totalDeducted || 0).toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                        <span className="font-semibold uppercase text-xs">{(w.payoutMethod || '—')}</span>
                        {w.payoutInfo && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {w.payoutInfo.paypalEmail || w.payoutInfo.mobileNumber || w.payoutInfo.bankAccountNumber || '—'}
                            </span>
                        )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        w.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : w.status === 'paid' || w.status === 'approved' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {w.status || 'pending'}
                    </span>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
