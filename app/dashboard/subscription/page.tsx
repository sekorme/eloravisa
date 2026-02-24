"use client"

import React, { useState, useEffect } from 'react'
import { Check,  Loader2, Sparkles, Zap, Shield, MessageCircle, Send, Coins } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SUBSCRIPTION_PLANS, PlanId } from '@/lib/subscriptions'
import { auth, db } from '@/firebase/client'
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore'
import { startPaystackPayment } from '@/lib/paystack'
import { getUserCurrencyInfo } from '@/lib/currency'
import { toast } from 'sonner'
import {convertCurrency} from "@/lib/convertCurrency";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

export default function SubscriptionPage() {
  type UserData = { planId?: string | null; fullName?: string | null } | null

  const [userData, setUserData] = useState<UserData>(null)
  const [loading, setLoading] = useState(true)
  const [payingPlan, setPayingPlan] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoNotFoundOpen, setPromoNotFoundOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null)
  const [pendingPromo, setPendingPromo] = useState<string | null>(null)

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        const d = doc.data()
        setUserData(d ? (d as UserData) : null)
        setLoading(false)
      })
      return () => unsub()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // keep for possible future use; attempt to fetch currency but ignore result for now
    getUserCurrencyInfo().catch(() => {})
  }, [])
    
    

  const handleSubscribe = async (planKey: PlanId) => {
    const plan = SUBSCRIPTION_PLANS[planKey]
    if (plan.price === 0) {
        // Free plan is handled differently, usually on onboarding
        toast.info("Basic plan is free for everyone!")
        return
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      toast.error("Please sign in to subscribe")
      return
    }

    setPayingPlan(planKey)

    try {
      // If a promo code was entered, verify it exists in the influencers collection.
      // If it doesn't exist, ask the user if they want to continue without it or re-enter.
      let promoToUse: string | null = promoCode.trim() ? promoCode.trim() : null
      if (promoToUse) {
        try {
          const inflRef = collection(db, 'influencers')
          const q = query(inflRef, where('promoCode', '==', promoToUse))
          const snap = await getDocs(q)
          if (snap.empty) {
            // Open modal to let the user continue without the promo code or cancel to re-enter
            setPendingPlan(planKey)
            setPendingPromo(promoToUse)
            setPromoNotFoundOpen(true)
            // stop here; the modal will resume the flow if the user confirms
            return
          }
        } catch (err) {
          console.error('Error validating promo code:', err)
          // Don't block payment on validation errors — allow user to continue but notify.
          toast.warning('Could not verify promo code. You can continue to payment or try again.')
        }
      }
       // Convert price to currency
       // For simplicity, let's assume the $20 and $40 are in USD and we want to pay in GHS or currency
       // Usually Paystack handles GHS/NGN/USD/KES/ZAR.
       // Let's assume the price is in USD and convert to GHS for Paystack if needed,
       // or just use USD if the merchant account supports it.
       // Paystack expects amount in minor units.

       // delegate full payment flow to helper so modal can resume it
       await startPaymentFlow(planKey, promoToUse)
     } catch (error) {
       console.error(error)
       toast.error("Failed to initialize payment")
       setPayingPlan(null)
     }
  }

  // Helper to start the Paystack flow (extracted to allow modal to resume)
  async function startPaymentFlow(planKey: PlanId, promoToUse: string | null) {
    const plan = SUBSCRIPTION_PLANS[planKey]
    try {
      const priceUSD = plan.price
      const amount = await convertCurrency(priceUSD, 'GHS')

      await startPaystackPayment(
        auth.currentUser.email,
        amount,
        'GHS',
        plan.id,
        async (reference) => {
          try {
            const res = await fetch('/api/paystack-success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: auth.currentUser?.email,
                reference,
                planId: planKey,
                promoCode: promoToUse || null,
              }),
            })
            const data = await res.json()
            if (data.success) {
              toast.success(planKey === 'TOPUP_50' ? 'Tokens added successfully!' : `Welcome to the ${plan.name}!`)
            } else {
              toast.error(data.error || 'Failed to update subscription')
            }
          } catch {
            toast.error('An error occurred while updating your subscription')
          } finally {
            setPayingPlan(null)
            // clear pending state
            setPendingPlan(null)
            setPendingPromo(null)
            setPromoNotFoundOpen(false)
          }
        }
      )
    } catch (err) {
      console.error('Payment init error:', err)
      toast.error('Failed to initialize payment')
      setPayingPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const currentPlanId = userData?.planId || 'free'

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Choose Your Plan</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          Get the tokens you need to power your visa application journey. All tokens are valid for one month and roll over if you renew.
        </p>

        <div className="max-w-xs mx-auto pt-4 space-y-2">
          <Label htmlFor="promoCode" className="text-sm font-semibold">Have a Promo Code? (Get 50 extra tokens)</Label>
          <Input 
            id="promoCode" 
            placeholder="Enter code" 
            value={promoCode} 
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="text-center font-bold tracking-widest"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FREE PLAN */}
        <Card className={`relative flex flex-col ${currentPlanId === 'free' ? 'border-2 border-indigo-600 shadow-xl' : 'border border-slate-200 dark:border-slate-800'}`}>
          {currentPlanId === 'free' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Current Plan
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{SUBSCRIPTION_PLANS.FREE.name}</CardTitle>
            <CardDescription>Perfect for exploring the platform.</CardDescription>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black">${SUBSCRIPTION_PLANS.FREE.price}</span>
              <span className="ml-1 text-slate-500 text-sm">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{SUBSCRIPTION_PLANS.FREE.tokens} AI Tokens</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <X className="w-5 h-5 shrink-0" />
                <span>AI Chatbot Assistant</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Document Storage</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <X className="w-5 h-5 shrink-0" />
                <span>Special Telegram Group</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              {currentPlanId === 'free' ? 'Default Plan' : 'Free'}
            </Button>
          </CardFooter>
        </Card>

        {/* PRO PLAN */}
        <Card className={`relative flex flex-col ${currentPlanId === 'pro' ? 'border-2 border-indigo-600 shadow-xl' : 'border border-slate-200 dark:border-slate-800'}`}>
          {currentPlanId === 'pro' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Current Plan
            </div>
          )}
          <div className="absolute top-4 right-4 text-indigo-600">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{SUBSCRIPTION_PLANS.PRO.name}</CardTitle>
            <CardDescription>Most popular for active applicants.</CardDescription>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black">${SUBSCRIPTION_PLANS.PRO.price}</span>
              <span className="ml-1 text-slate-500 text-sm">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="font-bold">{SUBSCRIPTION_PLANS.PRO.tokens} AI Tokens</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>AI Chatbot Assistant (Elora)</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Document Storage & Management</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <X className="w-5 h-5 shrink-0" />
                <span>Special Telegram Group</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
                onClick={() => handleSubscribe('PRO')} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={payingPlan === 'PRO' || currentPlanId === 'pro'}
            >
              {payingPlan === 'PRO' ? <Loader2 className="w-4 h-4 animate-spin" /> : currentPlanId === 'pro' ? 'Renew Plan' : 'Subscribe Now'}
            </Button>
          </CardFooter>
        </Card>

        {/* FULL PLAN */}
        <Card className={`relative flex flex-col ${currentPlanId === 'full' ? 'border-2 border-indigo-600 shadow-xl' : 'border border-slate-200 dark:border-slate-800'}`}>
          {currentPlanId === 'full' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Current Plan
            </div>
          )}
          <div className="absolute top-4 right-4 text-amber-500">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{SUBSCRIPTION_PLANS.FULL.name}</CardTitle>
            <CardDescription>Everything you need for success.</CardDescription>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-black">${SUBSCRIPTION_PLANS.FULL.price}</span>
              <span className="ml-1 text-slate-500 text-sm">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="font-bold">{SUBSCRIPTION_PLANS.FULL.tokens} AI Tokens</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Full AI Chatbot Access</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="font-bold text-amber-600 dark:text-amber-400">Special Telegram Group</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Priority Document Reviews</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
                onClick={() => handleSubscribe('FULL')} 
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 text-white"
                disabled={payingPlan === 'FULL' || currentPlanId === 'full'}
            >
              {payingPlan === 'FULL' ? <Loader2 className="w-4 h-4 animate-spin" /> : currentPlanId === 'full' ? 'Renew Plan' : 'Go Full Features'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Top Up Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Need More Tokens?</h2>
        <div className="max-w-md mx-auto">
            <Card className="border-2 border-amber-400 shadow-lg bg-amber-50/50 dark:bg-amber-900/10">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-bold text-amber-700 dark:text-amber-400">Token Top-Up</CardTitle>
                            <CardDescription>Add tokens without changing your plan.</CardDescription>
                        </div>
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                            <Coins className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-3xl font-black text-amber-700 dark:text-amber-400">${SUBSCRIPTION_PLANS.TOPUP_50.price}</span>
                        <span className="ml-1 text-slate-500 text-sm">one-time</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-amber-600 shrink-0" />
                            <span className="font-bold text-amber-800 dark:text-amber-200">{SUBSCRIPTION_PLANS.TOPUP_50.tokens} AI Tokens</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-amber-600 shrink-0" />
                            <span className="text-amber-800 dark:text-amber-200">Instant Credit</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-amber-600 shrink-0" />
                            <span className="text-amber-800 dark:text-amber-200">Never Expires</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={() => handleSubscribe('TOPUP_50')} 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white border-none"
                        disabled={payingPlan === 'TOPUP_50'}
                    >
                        {payingPlan === 'TOPUP_50' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Top Up Now'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>

      <div className="mt-16 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-6 text-center uppercase tracking-widest text-slate-400">Token Cost Guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                <Shield className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Document Review</p>
                <p className="font-black text-lg">5 Tokens</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                <MessageCircle className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Mock Interview</p>
                <p className="font-black text-lg">10 Tokens</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                <Send className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Document Draft</p>
                <p className="font-black text-lg">5 Tokens</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                <Sparkles className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Information</p>
                <p className="font-black text-lg">5 Tokens</p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo not-found confirmation dialog (rendered at end so it's inside the same client component) */}
      <PromoNotFoundDialog
        open={promoNotFoundOpen}
        onOpenChange={setPromoNotFoundOpen}
        onContinue={() => {
          // user confirmed to continue without promo code
          startPaymentFlow(pendingPlan!, pendingPromo)
        }}
        promo={pendingPromo}
      />
    </div>
  )
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

// Promo not-found confirmation dialog (rendered at end so it's inside the same client component)
export function PromoNotFoundDialog({
  open,
  onOpenChange,
  onContinue,
  promo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
  promo: string | null
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promo code not found</AlertDialogTitle>
          <AlertDialogDescription>
            The promo code "{promo}" could not be found. You can continue to payment without a promo
            code, or cancel to re-enter a different code.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>Continue to payment</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
