"use client"

import { useMemo } from "react"
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { useDashboardData } from "@/context/DashboardDataContext"
import { documentTitle, getRequiredDocuments } from "@/utils/documentConfig"
import { isRealProblem, plainText } from "@/lib/reviewIssues"
import { dashCard, dashCardSubtitle, dashCardTitle } from "./dashboardStyles"
import { EmptyState } from "./delight/EmptyState"

export function AlertsSection() {
  const { reviews, userData, loading } = useDashboardData()

  const alerts = useMemo(() => {
    const newAlerts: any[] = []

    // Only documents on the current checklist: reviews left over from another
    // visa type would be noise (and inflate the count).
    const required = new Set(getRequiredDocuments(userData?.onboarding?.visaType).map((d) => d.key))
    reviews.filter((r) => required.has(r.id)).forEach((review) => {
      const docName = documentTitle(review.id)
      // Drop reassurances the AI sometimes lists as problems (lib/reviewIssues.ts).
      const clean = (list: unknown) => (Array.isArray(list) ? list.filter(isRealProblem).map(plainText) : [])
      const data = {
        id: review.id,
        inconsistencies: clean(review.inconsistencies),
        risk_flags: clean(review.risk_flags),
        missing_info: clean(review.missing_info),
      }

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
  }, [reviews, userData?.onboarding?.visaType])

  if (loading) {
    return (
      <div className="h-[300px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>
    )
  }

  return (
    <div id="alerts-warnings-card" className={cn("p-5", dashCard)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className={dashCardTitle}>Alerts</h2>
          <p className={dashCardSubtitle}>Issues the AI found in your documents</p>
        </div>
        {alerts.length > 0 && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
            {alerts.length} {alerts.length === 1 ? "issue" : "issues"}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {alerts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full divide-y divide-lp-line">
            {alerts.map((alert) => (
              <AccordionItem 
                key={alert.id} 
                value={alert.id} 
                className="border-0"
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span
                      className={cn("h-2 w-2 shrink-0 rounded-full", alert.type === "critical" ? "bg-red-500" : "bg-amber-500")}
                      aria-label={alert.type === "critical" ? "Important" : "Worth checking"}
                    />
                    <p className="text-sm font-medium text-lp-fg">{alert.title}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-2 pl-5 pt-0">
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
          <EmptyState art="check" title="No issues found">
            <p className="text-lp-muted">Your reviewed documents look good so far.</p>
          </EmptyState>
        )}
      </div>
    </div>
  )
}
