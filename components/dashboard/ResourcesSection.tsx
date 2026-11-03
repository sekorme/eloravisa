"use client"

import { Mic, Info, Headset } from "lucide-react"
import {UploadDocumentsModal} from "@/components/UploadDocumentsModal";
import {useRouter} from "next/navigation";
import { cn } from "@/lib/utils";
import { dashCard, dashCardTitle } from "./dashboardStyles";

export function ResourcesSection() {
    const router = useRouter()
  const tile = "group relative flex min-h-[112px] flex-col items-start justify-between rounded-[1.25rem] border border-lp-line bg-lp-card p-4 text-left transition-[transform,border-color,background-color] duration-300 hover:border-lp-azure/40 hover:bg-lp-card-2 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure md:p-5"
  const iconTile = "flex h-10 w-10 items-center justify-center rounded-xl bg-lp-sky text-lp-azure transition-transform duration-300 group-hover:-rotate-6"
  const label = "font-display text-base font-semibold tracking-[-0.02em] text-lp-fg"
  return (
    <div id="quick-actions" className={cn("p-5 md:p-6", dashCard)}>
      <div className="mb-4">
        <h2 className={dashCardTitle}>Quick actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="relative min-h-[112px]">
          <UploadDocumentsModal variant="tileLight"/>
        </div>

        <button onClick={() => router.push("/dashboard/ai-mock-interview")} className={tile}>
          <div className={iconTile}>
            <Mic className="h-5 w-5" />
          </div>
          <span className={label}>AI Interview</span>
        </button>
        <button onClick={() => router.push("/dashboard/information")} className={tile}>
          <div className={iconTile}>
            <Info className="h-5 w-5" />
          </div>
          <span className={label}>View Guides</span>
        </button>
        <button className={tile}>
          <div className={iconTile}>
            <Headset className="h-5 w-5" />
          </div>
          <span className={label}>Get Support</span>
        </button>
      </div>
    </div>
  )
}
