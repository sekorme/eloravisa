"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { auth } from '@/firebase/client'
import { getInfluencerData } from '@/lib/influencerAuth'

interface Props {
  availableBalance: number
  onSuccess?: (newBalance: number) => void
}

export default function WithdrawalForm({ availableBalance, onSuccess }: Props) {
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('paypal')
  const [payoutDetails, setPayoutDetails] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [bankSortCode, setBankSortCode] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [prefilled, setPrefilled] = useState(false)

  const resetForm = () => {
    setWithdrawAmount('')
    setPayoutDetails('')
    setMobileNumber('')
    setBankAccountName('')
    setBankAccountNumber('')
    setBankName('')
    setBankSortCode('')
  }

  useEffect(() => {
    // Prefill with saved withdrawalSettings if available
    (async () => {
      try {
        const user = auth.currentUser
        if (!user) return
        const data: any = await getInfluencerData(user.uid)
        const settings = data?.withdrawalSettings
        if (settings) {
          if (settings.payoutMethod) setPayoutMethod(settings.payoutMethod)
          if (settings.paypalEmail) setPayoutDetails(settings.paypalEmail)
          if (settings.mobileNumber) setMobileNumber(settings.mobileNumber)
          if (settings.bankName) setBankName(settings.bankName)
          if (settings.bankAccountNumber) setBankAccountNumber(settings.bankAccountNumber)
          if (settings.bankAccountName) setBankAccountName(settings.bankAccountName)
          if (settings.bankSortCode) setBankSortCode(settings.bankSortCode)
          setPrefilled(true)
        }
      } catch (e) {
        // silent fail
      }
    })()
  }, [])

  const handleRequestWithdrawal = async () => {
    const amt = parseFloat(withdrawAmount || '0')
    if (isNaN(amt) || amt <= 0) return toast.error('Enter a valid amount')

    const tax = Math.round(amt * 0.10 * 100) / 100
    const transferFee = Math.round(amt * 0.05 * 100) / 100
    const total = Math.round((amt + tax + transferFee) * 100) / 100

    if (total > availableBalance) return toast.error('Total exceeds available balance')

    // Validate payout details
    if (payoutMethod === 'paypal') {
      if (!payoutDetails || !payoutDetails.includes('@')) return toast.error('Enter a valid PayPal email')
    } else if (payoutMethod === 'mobile') {
      if (!mobileNumber || mobileNumber.trim().length < 7) return toast.error('Enter a valid mobile number')
    } else if (payoutMethod === 'bank') {
      if (!bankName || !bankAccountNumber || !bankAccountName) return toast.error('Enter complete bank details')
    }

    setRequesting(true)
    try {
      const user = auth.currentUser
      if (!user) return toast.error('Not authenticated')
      const idToken = await user.getIdToken()

      const res = await fetch('/api/affiliate/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          requestedAmount: Math.round(amt * 100) / 100,
          taxAmount: tax,
          transferFee,
          totalDeducted: total,
          payoutMethod,
          payoutInfo: payoutMethod === 'paypal' ? { paypalEmail: payoutDetails } : payoutMethod === 'mobile' ? { mobileNumber } : { bankName, bankAccountNumber, bankAccountName, bankSortCode },
        }),
      })

      const payload = await res.json()
      if (!res.ok) return toast.error(payload.error || 'Failed to create withdrawal')

      if (payload?.newBalance !== undefined) {
        onSuccess?.(payload.newBalance)
      }

      toast.success('Withdrawal request submitted')
      resetForm()
    } catch (err) {
      console.error('Withdrawal error:', err)
      toast.error('Failed to submit request')
    } finally {
      setRequesting(false)
    }
  }

  const canRequest = (() => {
    const amt = parseFloat(withdrawAmount || '0') || 0
    const tax = Math.round(amt * 0.10 * 100) / 100
    const transferFee = Math.round(amt * 0.05 * 100) / 100
    const total = Math.round((amt + tax + transferFee) * 100) / 100
    return total > 0 && total <= availableBalance
  })()

  return (
    <Card className="shadow-lg border-none ring-1 ring-border/50">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-xl font-bold">Request Withdrawal</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-4 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col justify-center items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary/70 mb-1">Available balance</p>
            <div className="text-4xl font-black text-primary">${availableBalance.toFixed(2)}</div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl border-2 border-muted bg-background px-8 py-3 text-lg font-bold transition-colors focus:border-primary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Payout method</label>
                <select 
                  value={payoutMethod} 
                  onChange={(e) => setPayoutMethod(e.target.value)} 
                  className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 text-lg font-semibold transition-colors focus:border-primary focus:outline-none appearance-none"
                >
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="mobile">Mobile Money</option>
                </select>
              </div>
            </div>

            {payoutMethod === 'paypal' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">PayPal Email</label>
                <input
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium transition-colors focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {payoutMethod === 'mobile' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Mobile Money Number</label>
                <input
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium transition-colors focus:border-primary focus:outline-none"
                />
              </div>
            )}

            {payoutMethod === 'bank' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Bank Name</label>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Barclays"
                    className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Account Number</label>
                  <input
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Account Number"
                    className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Account Name</label>
                  <input
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Sort Code / IBAN</label>
                  <input
                    value={bankSortCode}
                    onChange={(e) => setBankSortCode(e.target.value)}
                    placeholder="Sort Code"
                    className="w-full rounded-xl border-2 border-muted bg-background px-4 py-3 font-medium transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-dashed">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  {(() => {
                    const amt = parseFloat(withdrawAmount || '0') || 0
                    const tax = Math.round(amt * 0.10 * 100) / 100
                    const transferFee = Math.round(amt * 0.05 * 100) / 100
                    const total = Math.round((amt + tax + transferFee) * 100) / 100
                    return (
                      <div className="text-sm">
                        <div className="flex gap-4 text-muted-foreground">
                          <span>Tax (10%): <strong>${tax.toFixed(2)}</strong></span>
                          <span>Fee (5%): <strong>${transferFee.toFixed(2)}</strong></span>
                        </div>
                        <div className="mt-1 text-base">
                          Total Deduction: <span className="font-bold text-foreground">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <Button 
                  onClick={handleRequestWithdrawal} 
                  disabled={!canRequest || requesting}
                  size="lg"
                  className="px-8 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {requesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : 'Confirm Withdrawal'}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-semibold opacity-60">
                Requests are typically processed within 3-5 business days.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

