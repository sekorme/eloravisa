"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { auth } from "@/firebase/client"
import { celebrate } from "./celebrate"

/**
 * Celebrates when the journey's completed-milestone count goes up. The last
 * count seen is kept per browser and per applicant (family accounts), and the
 * first visit only records it, so existing progress doesn't set off confetti.
 */
export function MilestoneWatcher({ count, memberId }: { count: number; memberId: string }) {
  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) return
    const key = `milestones:${uid}:${memberId}`
    // Missing on the first visit (Number(null) is 0), so nothing fires then.
    const previous = Number(localStorage.getItem(key))
    localStorage.setItem(key, String(count))
    if (previous > 0 && count > previous) {
      celebrate()
      toast.success(count === 5 ? "Every milestone done. You're ready!" : `Milestone reached: ${count} of 5 done`)
    }
  }, [count, memberId])
  return null
}
