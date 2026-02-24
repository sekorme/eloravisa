"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Gift, Copy } from 'lucide-react'

interface Props {
  promoCode?: string | null
  onCopy: (text: string) => void
}

export default function PromoCodeCard({ promoCode, onCopy }: Props) {
  return (
    <div className="w-full relative group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/30 rounded-lg backdrop-blur-md">
                <Gift className="h-4 w-4 text-blue-200" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Your Promo Code
              </span>
            </div>
            <div className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-black/20 rounded-xl px-4 py-3 border border-white/5 flex items-center justify-between group/code cursor-pointer transition-all hover:bg-black/30"
                 onClick={() => onCopy(promoCode || '')}>
              <span className="text-2xl md:text-3xl font-black tracking-widest text-white font-mono uppercase">
                {promoCode || '---'}
              </span>
              <div className="p-2 bg-white/10 rounded-lg opacity-60 group-hover/code:opacity-100 transition-opacity">
                <Copy className="h-4 w-4 text-white" />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition-all active:scale-95"
              onClick={() => onCopy(promoCode || '')}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
          </div>

          <div className="mt-5 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-100">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                <span>Earn 10% Commission</span>
              </div>
              <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/70">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

