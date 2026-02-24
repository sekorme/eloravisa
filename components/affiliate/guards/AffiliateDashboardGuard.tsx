"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"
import { Loader2 } from "lucide-react"

export default function AffiliateDashboardGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let ignore = false
    async function verify() {
      // If no user, redirect to affiliate signin
      if (!user) {
        router.push("/affiliate/signin")
        return
      }
      try {
        const data = await getInfluencerData(user.uid)
        if (!data) {
          // Not an influencer
          router.push("/affiliate/signin")
          return
        }
      } finally {
        if (!ignore) setChecking(false)
      }
    }
    verify()
    return () => { ignore = true }
  }, [user, router])

  if (checking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}
