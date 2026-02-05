    "use client"

import React, { useState, useEffect } from 'react'
import { Check,  Loader2, Sparkles, Zap, Shield, MessageCircle, Send, Coins } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SUBSCRIPTION_PLANS, PlanId } from '@/lib/subscriptions'
import { auth, db } from '@/firebase/client'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { startPaystackPayment } from '@/lib/paystack'
import { getUserCurrencyInfo, convertGHS } from '@/lib/currency'
import { toast } from 'sonner'
import {convertCurrency} from "@/lib/convertCurrency";

export default function SubscriptionPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payingPlan, setPayingPlan] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
        setUserData(doc.data())
        setLoading(false)
      })
      return () => unsub()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getUserCurrencyInfo().then(info => {
      setCurrency(info.currency || 'USD')
    })
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
      // Convert price to currency
      // For simplicity, let's assume the $20 and $40 are in USD and we want to pay in GHS or currency
      // Usually Paystack handles GHS/NGN/USD/KES/ZAR. 
      // Let's assume the price is in USD and convert to GHS for Paystack if needed, 
      // or just use USD if the merchant account supports it.
      // Paystack expects amount in minor units.
      
      const priceUSD = plan.price;
      // Mock conversion for Paystack GHS if needed, but let's try USD first
      const amount = await convertCurrency(priceUSD, "GHS"); 

      await startPaystackPayment(
        auth.currentUser.email,
        amount,
        'GHS',
        plan.id,
        async (reference) => {
          try {
            const res = await fetch("/api/paystack-success", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                email: auth.currentUser?.email, 
                reference, 
                planId: planKey 
              }),
            });
            const data = await res.json();
            if (data.success) {
              toast.success(planKey === 'TOPUP_50' ? 'Tokens added successfully!' : `Welcome to the ${plan.name}!`);
            } else {
              toast.error(data.error || "Failed to update subscription");
            }
          } catch (err) {
            toast.error("An error occurred while updating your subscription");
          } finally {
            setPayingPlan(null);
          }
        }
      )
    } catch (error) {
      console.error(error)
      toast.error("Failed to initialize payment")
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
    </div>
  )
}

function X(props: any) {
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
