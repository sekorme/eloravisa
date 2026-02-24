"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"

export default function AffiliatePublicGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let ignore = false
    async function maybeRedirect() {
      // Do not run guard on dashboard routes
      if (pathname?.startsWith("/affiliate/dashboard")) return
      if (!user) return
      try {
        const data = await getInfluencerData(user.uid)
        if (data) {
          router.push("/affiliate/dashboard")
        }
      } finally {
        // no state to update
      }
    }
    maybeRedirect()
    return () => { ignore = true }
  }, [user, router, pathname])

  return <>{children}</>
}
