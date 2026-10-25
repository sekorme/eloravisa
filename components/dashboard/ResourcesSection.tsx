"use client"

import { Mic, Info, Headset } from "lucide-react"
import {UploadDocumentsModal} from "@/components/UploadDocumentsModal";
import {useRouter} from "next/navigation";

export function ResourcesSection() {
    const router = useRouter()
  const tile = "group relative flex min-h-[168px] flex-col items-start justify-between rounded-[1.25rem] border border-lp-line bg-lp-card p-5 text-left transition-[transform,border-color,background-color] duration-300 hover:border-lp-azure/40 hover:bg-lp-card-2 motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure md:p-6"
  const iconTile = "flex h-12 w-12 items-center justify-center rounded-xl bg-lp-sky text-lp-azure transition-transform duration-300 group-hover:-rotate-6"
  const label = "font-display text-base font-semibold tracking-[-0.02em] text-lp-fg"
  const index = "absolute right-5 top-5 font-display text-[10px] text-lp-muted/60"
  return (
    <div id="quick-actions" className="rounded-[1.5rem] border border-lp-line bg-lp-card p-6 text-lp-fg md:p-8 lp-shadow">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Common tasks at your fingertips</span>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] md:text-3xl">Quick Actions</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 md:gap-5">
        <div className="relative min-h-[168px]">
          <span className="pointer-events-none absolute right-5 top-5 z-10 font-display text-[10px] text-white/50">01</span>
          <UploadDocumentsModal variant="tile"/>
        </div>

        <button onClick={() => router.push("/dashboard/ai-mock-interview")} className={tile}>
          <span className={index}>02</span>
          <div className={iconTile}>
            <Mic className="h-6 w-6" />
          </div>
          <span className={label}>AI Interview</span>
        </button>
        <button onClick={() => router.push("/dashboard/information")} className={tile}>
          <span className={index}>03</span>
          <div className={iconTile}>
            <Info className="h-6 w-6" />
          </div>
          <span className={label}>View Guides</span>
        </button>
        <button className={tile}>
          <span className={index}>04</span>
          <div className={iconTile}>
            <Headset className="h-6 w-6" />
          </div>
          <span className={label}>Get Support</span>
        </button>
      </div>
    </div>
  )
}
