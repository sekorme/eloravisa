"use client"

import React, { useEffect, useState } from 'react'
import Sparkline from './Sparkline'
import { TrendingUp, DollarSign, Users, ArrowUpRight, Activity } from 'lucide-react'
import PromoCodeCard from "@/components/affiliate/PromoCodeCard";
import {toast} from "sonner";

interface Props {
  name?: string
  balance?: number
  referralCount?: number
  monthlyData?: number[]
  promoCode?:string
  totalWithdrawn?: number
}

export default function AffiliateHero({promoCode, name, balance = 0, referralCount = 0, monthlyData = [], totalWithdrawn = 0 }: Props) {
  const recent = monthlyData && monthlyData.length ? monthlyData.slice(-12) : []
  const [conversion, setConversion] = useState('0.0')

  useEffect(() => {
    // calculate a more realistic conversion if we had clicks, but for now we keep it dynamic-ish or fixed
    // Since we don't have total clicks, let's just use a reasonable number or remove the random
    setConversion('3.2')
  }, [])

  const totalReferrals = referralCount || recent.reduce((a, b) => a + b, 0)
  // Total Earned = Current Balance + Total Withdrawn
  const totalEarned = (balance || 0) + (totalWithdrawn || 0)
  
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Promo code copied to clipboard!")
    }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"></div>

      <div className="relative p-6 md:p-10">
        <div className="flex flex-col lg:flex-row justify-between gap-8 lg:items-center">
          {/* Left Section: Welcome & Main Stats */}
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex items-center gap-2 text-blue-200 mb-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-sm font-medium uppercase tracking-wider">Affiliate Dashboard</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
                Welcome back{name ? `, ${name.split(' ')[0]}` : ''}!
              </h3>
              <p className="mt-2 text-blue-100 max-w-lg text-lg">
                Track your earnings, monitor referrals, and optimize your performance all in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
               <div className="flex-1 min-w-[140px] rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2 text-blue-200 mb-1">
                    <div className="p-1.5 rounded-lg bg-blue-500/30">
                        <DollarSign className="h-4 w-4 text-blue-100" />
                    </div>
                    <span className="text-sm font-medium">Balance</span>
                  </div>
                  <div className="text-3xl font-bold mt-2">${(balance || 0).toFixed(2)}</div>
               </div>

               <div className="flex-1 min-w-[140px] rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2 text-blue-200 mb-1">
                    <div className="p-1.5 rounded-lg bg-green-500/30">
                        <Users className="h-4 w-4 text-green-100" />
                    </div>
                    <span className="text-sm font-medium">Referrals</span>
                  </div>
                  <div className="text-3xl font-bold mt-2">{totalReferrals}</div>
               </div>

               <div className="flex-1 min-w-[140px] rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-center gap-2 text-blue-200 mb-1">
                    <div className="p-1.5 rounded-lg bg-purple-500/30">
                        <Activity className="h-4 w-4 text-purple-100" />
                    </div>
                    <span className="text-sm font-medium">Points</span>
                  </div>
                  <div className="text-3xl font-bold mt-2">{totalReferrals * 10}</div>
               </div>
            </div>
          </div>

          {/* Right Section: Chart & Performance */}
          <div className="lg:w-1/3">
             <div className="h-full rounded-2xl bg-black/20 p-6 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <PromoCodeCard
                    promoCode={promoCode}
                    onCopy={handleCopy}
                />
             </div>
          </div>
        </div>

        {/* Footer Stats Grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-6">
           <div className="group">
              <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1 group-hover:text-white transition-colors">Total Earned</div>
              <div className="text-xl font-semibold">${totalEarned.toFixed(2)}</div>
           </div>
           <div className="group">
              <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1 group-hover:text-white transition-colors">Total Withdrawn</div>
              <div className="text-xl font-semibold">${(totalWithdrawn || 0).toFixed(2)}</div>
           </div>
           <div className="group">
              <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1 group-hover:text-white transition-colors">Account Status</div>
              <div className="text-xl font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                Active
              </div>
           </div>
           <div className="group">
              <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1 group-hover:text-white transition-colors">Commission Rate</div>
              <div className="text-xl font-semibold flex items-center gap-1">
                10% <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
