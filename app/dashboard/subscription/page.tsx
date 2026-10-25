"use client"

import React, { useState, useEffect } from 'react'
import { Check,  Loader2, Sparkles, Zap, Shield, MessageCircle, Send, Coins } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { SUBSCRIPTION_PLANS, PlanId } from '@/lib/subscriptions'
import { auth, db } from '@/firebase/client'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { startPaystackPayment } from '@/lib/paystack'
import { getUserCurrencyInfo } from '@/lib/currency'
import { toast } from 'sonner'
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
      // If a promo code was entered, verify it against the promo_codes
      // collection (doc id = code, created at influencer signup). The old
      // query against `influencers` is no longer readable under
      // firestore.rules — influencer docs are owner-only.
      // Codes are stored uppercase (see lib/influencerAuth.ts), and the
      // server-side influencer lookup is case-sensitive, so normalize once
      // here and use the same value for validation and payment.
      let promoToUse: string | null = promoCode.trim() ? promoCode.trim().toUpperCase() : null
      if (promoToUse) {
        try {
          const promoSnap = await getDoc(doc(db, 'promo_codes', promoToUse))
          if (!promoSnap.exists()) {
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
      // Amount and currency are decided server-side by /api/paystack-initialize.
      await startPaystackPayment(
        planKey,
        promoToUse || null,
        async (reference) => {
          try {
            const idToken = await auth.currentUser?.getIdToken()
            const res = await fetch('/api/paystack-success', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({ reference }),
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
        },
        () => {
          // Cancelled/failed checkout — release the button spinner.
          setPayingPlan(null)
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
        <Loader2 className="w-8 h-8 animate-spin text-lp-azure" />
      </div>
    )
  }

  const currentPlanId = userData?.planId || 'free'

  const plans: {
    id: string
    key?: 'PRO' | 'FULL'
    plan: { name: string; price: number | string; tokens: number }
    blurb: string
    icon?: typeof Zap
    featured?: boolean
    features: { label: string; included: boolean; strong?: boolean }[]
    cta: string
  }[] = [
    {
      id: 'free',
      plan: SUBSCRIPTION_PLANS.FREE,
      blurb: "Perfect for exploring the platform.",
      features: [
        { label: `${SUBSCRIPTION_PLANS.FREE.tokens} AI Tokens`, included: true },
        { label: "AI Chatbot Assistant", included: false },
        { label: "Document Storage", included: true },
        { label: "Special Telegram Group", included: false },
      ],
      cta: currentPlanId === 'free' ? 'Default Plan' : 'Free',
    },
    {
      id: 'pro',
      key: 'PRO',
      plan: SUBSCRIPTION_PLANS.PRO,
      blurb: "Most popular for active applicants.",
      icon: Zap,
      featured: true,
      features: [
        { label: `${SUBSCRIPTION_PLANS.PRO.tokens} AI Tokens`, included: true, strong: true },
        { label: "AI Chatbot Assistant (Elora)", included: true },
        { label: "Document Storage & Management", included: true },
        { label: "Special Telegram Group", included: false },
      ],
      cta: currentPlanId === 'pro' ? 'Renew Plan' : 'Subscribe Now',
    },
    {
      id: 'full',
      key: 'FULL',
      plan: SUBSCRIPTION_PLANS.FULL,
      blurb: "Everything you need for success.",
      icon: Sparkles,
      features: [
        { label: `${SUBSCRIPTION_PLANS.FULL.tokens} AI Tokens`, included: true, strong: true },
        { label: "Full AI Chatbot Access", included: true },
        { label: "Special Telegram Group", included: true, strong: true },
        { label: "Priority Document Reviews", included: true },
      ],
      cta: currentPlanId === 'full' ? 'Renew Plan' : 'Go Full Features',
    },
  ]

  const costs = [
    { label: "Document Review", value: "5 Tokens", icon: Shield },
    { label: "Mock Interview", value: "10 Tokens", icon: MessageCircle },
    { label: "Document Draft", value: "5 Tokens", icon: Send },
    { label: "Information", value: "5 Tokens", icon: Sparkles },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <Coins className="h-3.5 w-3.5 text-lp-azure" /> Plans & tokens
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] text-balance md:text-5xl">Choose Your Plan</h1>
        <p className="mx-auto max-w-2xl text-lp-muted">
          Get the tokens you need to power your visa application journey. All tokens are valid for one month and roll over if you renew.
        </p>

        <div className="mx-auto max-w-xs space-y-2 pt-4">
          <Label htmlFor="promoCode" className="text-sm font-semibold">Have a Promo Code? (Get 50 extra tokens)</Label>
          <Input 
            id="promoCode" 
            placeholder="Enter code" 
            value={promoCode} 
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="h-12 rounded-full border-lp-line bg-lp-card text-center font-display font-semibold tracking-[0.2em]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const dark = !!p.featured
          const current = currentPlanId === p.id
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-[1.75rem] p-7 lp-shadow ${dark ? "bg-lp-navy text-white" : "border border-lp-line bg-lp-card"} ${current ? "ring-2 ring-lp-azure ring-offset-2 ring-offset-lp-page" : ""}`}
            >
              {current && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-lp-azure px-4 py-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                  Current Plan
                </div>
              )}
              {p.icon && (
                <div className={`absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl ${dark ? "bg-white/10 text-[#8FCDAF]" : "bg-lp-sky text-lp-azure"}`}>
                  <p.icon className="h-5 w-5 fill-current" />
                </div>
              )}
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">{p.plan.name}</h2>
                <p className={`mt-1 text-sm ${dark ? "text-white/65" : "text-lp-muted"}`}>{p.blurb}</p>
                <div className="mt-6 flex items-baseline">
                  <span className="font-display text-5xl font-semibold tracking-[-0.05em]">${p.plan.price}</span>
                  <span className={`ml-1.5 text-sm ${dark ? "text-white/55" : "text-lp-muted"}`}>/month</span>
                </div>
              </div>
              <ul className={`my-7 flex-1 space-y-3 border-t pt-6 ${dark ? "border-white/10" : "border-lp-line"}`}>
                {p.features.map((f) => (
                  <li key={f.label} className={`flex items-start gap-3 text-sm ${f.included ? "" : dark ? "text-white/40" : "text-lp-muted/60"}`}>
                    {f.included ? (
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${dark ? "bg-[#8FCDAF]/20 text-[#8FCDAF]" : "bg-lp-sky text-lp-azure"}`}>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <X className="h-5 w-5 shrink-0 p-0.5" />
                    )}
                    <span className={f.strong ? "font-semibold" : ""}>{f.label}</span>
                  </li>
                ))}
              </ul>
              {p.key ? (
                <Button 
                    onClick={() => handleSubscribe(p.key!)} 
                    className={`h-12 w-full rounded-full font-semibold ${dark ? "bg-white text-lp-navy hover:bg-lp-sky-2" : "bg-lp-navy text-white hover:bg-lp-navy-2"}`}
                    disabled={payingPlan === p.key || current}
                >
                  {payingPlan === p.key ? <Loader2 className="w-4 h-4 animate-spin" /> : p.cta}
                </Button>
              ) : (
                <Button variant="outline" className="h-12 w-full rounded-full border-lp-line bg-transparent font-semibold" disabled>
                  {p.cta}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Top Up Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-center font-display text-2xl font-semibold tracking-[-0.04em]">Need More Tokens?</h2>
        <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-6 rounded-[1.75rem] border border-lp-line bg-lp-card p-7 sm:flex-row sm:items-center lp-shadow">
                <div className="flex-1">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lp-navy text-[#8FCDAF]">
                            <Coins className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl font-semibold tracking-[-0.03em]">Token Top-Up</h3>
                            <p className="text-sm text-lp-muted">Add tokens without changing your plan.</p>
                        </div>
                    </div>
                    <ul className="mt-5 flex flex-wrap gap-2">
                        {[`${SUBSCRIPTION_PLANS.TOPUP_50.tokens} AI Tokens`, "Instant Credit", "Never Expires"].map((f, i) => (
                            <li key={f} className={`flex items-center gap-1.5 rounded-full bg-lp-sky px-3 py-1 text-xs text-lp-fg ${i === 0 ? "font-semibold" : ""}`}>
                                <Check className="h-3.5 w-3.5 text-lp-azure" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:w-48">
                    <div className="flex items-baseline sm:justify-end">
                        <span className="font-display text-4xl font-semibold tracking-[-0.05em]">${SUBSCRIPTION_PLANS.TOPUP_50.price}</span>
                        <span className="ml-1.5 text-sm text-lp-muted">one-time</span>
                    </div>
                    <Button 
                        onClick={() => handleSubscribe('TOPUP_50')} 
                        className="h-12 w-full rounded-full bg-lp-azure font-semibold text-white hover:bg-lp-azure-2"
                        disabled={payingPlan === 'TOPUP_50'}
                    >
                        {payingPlan === 'TOPUP_50' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Top Up Now'}
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-16 rounded-[1.75rem] border border-lp-line bg-lp-card-2 p-6 md:p-8">
        <h2 className="mb-6 text-center font-display text-[11px] font-medium uppercase tracking-[0.2em] text-lp-muted">Token Cost Guide</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {costs.map((c) => (
            <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-lp-line bg-lp-card p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lp-sky text-lp-azure">
                  <c.icon className="h-5 w-5" />
              </div>
              <div>
                  <p className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">{c.label}</p>
                  <p className="font-display text-lg font-semibold tracking-[-0.02em]">{c.value}</p>
              </div>
            </div>
          ))}
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
      <AlertDialogContent className="rounded-[1.5rem] border-lp-line bg-lp-card text-lp-fg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display tracking-[-0.03em]">Promo code not found</AlertDialogTitle>
          <AlertDialogDescription>
            The promo code "{promo}" could not be found. You can continue to payment without a promo
            code, or cancel to re-enter a different code.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction className="rounded-full bg-lp-navy text-white hover:bg-lp-navy-2" onClick={onContinue}>Continue to payment</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
