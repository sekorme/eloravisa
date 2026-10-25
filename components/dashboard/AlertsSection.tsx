"use client"

import { useMemo } from "react"
import { AlertTriangle, AlertCircle, Info, AlertOctagon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useDashboardData } from "@/context/DashboardDataContext"

export function AlertsSection() {
  const { reviews, loading } = useDashboardData()

  const alerts = useMemo(() => {
    const newAlerts: any[] = []

    reviews.forEach((data) => {
      const docName = data.id.replace(/([A-Z])/g, ' $1').trim()

      if (data.inconsistencies && data.inconsistencies.length > 0) {
        newAlerts.push({
          id: `inconsistency-${data.id}`,
          type: "critical",
          title: `Profile Mismatch: ${docName}`,
          details: data.inconsistencies,
          icon: AlertOctagon
        })
      }

      if (data.risk_flags && data.risk_flags.length > 0) {
        newAlerts.push({
          id: `risk-${data.id}`,
          type: "critical",
          title: `Risk Detected: ${docName}`,
          details: data.risk_flags,
          icon: AlertCircle
        })
      }

      if (data.missing_info && data.missing_info.length > 0) {
        newAlerts.push({
          id: `missing-${data.id}`,
          type: "warning",
          title: `Missing Info: ${docName}`,
          details: data.missing_info,
          icon: AlertTriangle
        })
      }
    })

    newAlerts.sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === "critical" ? -1 : 1;
    })

    return newAlerts.slice(0, 5)
  }, [reviews])

  if (loading) {
    return (
      <div className="h-[300px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>
    )
  }

  return (
    <div id="alerts-warnings-card" className="group rounded-[1.5rem] border border-lp-line bg-lp-card p-6 text-lp-fg lp-shadow">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 transition-transform duration-300 group-hover:-rotate-6 dark:bg-amber-400/10">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">Alerts & Warnings</h2>
            <p className="text-xs text-lp-muted">Potential issues in your profile</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <div className="shrink-0 rounded-full bg-lp-navy px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-white">
            {alerts.length} New
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {alerts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {alerts.map((alert) => (
              <AccordionItem 
                key={alert.id} 
                value={alert.id} 
                className={cn(
                  "rounded-xl border !border-b",
                  {
                    "border-red-200 bg-red-50/60 dark:border-red-400/20 dark:bg-red-400/[0.06]": alert.type === "critical",
                    "border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/[0.06]": alert.type === "warning",
                  }
                )}
              >
                <AccordionTrigger className="p-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <alert.icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      {
                        "text-red-600 dark:text-red-300": alert.type === "critical",
                        "text-amber-600 dark:text-amber-300": alert.type === "warning",
                      }
                    )} />
                    <p className="text-sm font-semibold text-lp-fg">{alert.title}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-2 pl-10 pt-0">
                    <ul className="list-disc space-y-1 text-xs leading-relaxed text-lp-muted marker:text-lp-fg/30">
                      {alert.details.map((detail: string, i: number) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rounded-xl border border-lp-line bg-lp-sky-2 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lp-sky">
                <Info className="h-4 w-4 text-lp-azure" />
              </div>
              <div>
                <p className="mb-0.5 text-sm font-semibold text-lp-fg">No Critical Alerts</p>
                <p className="text-xs text-lp-muted">Great job! Your documents look good so far.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
