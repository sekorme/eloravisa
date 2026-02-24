"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default function ProgramDetails() {
  return (
    <Card className="shadow-md border-none ring-1 ring-border/50">
      <CardHeader className="bg-muted/30 pb-3 border-b">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Program Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors">
            <h4 className="font-bold text-sm mb-1 text-primary">Commission Rate</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Earn <span className="text-foreground font-semibold">10%</span> on every payment made using your unique promo code.
            </p>
          </div>
          <div className="p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors">
            <h4 className="font-bold text-sm mb-1 text-primary">User Reward</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your referrals get <span className="text-foreground font-semibold">50 extra tokens</span> when they use your code.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

