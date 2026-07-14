"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, AlertCircle, Info, AlertOctagon } from "lucide-react"
import { auth, db } from "@/firebase/client"
import { collection, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export function AlertsSection() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const reviewsRef = collection(db, "users", user.uid, "reviews")
        const unsubscribeSnapshot = onSnapshot(reviewsRef, (snapshot) => {
          const newAlerts: any[] = []

          snapshot.forEach((doc) => {
            const data = doc.data()
            const docName = doc.id.replace(/([A-Z])/g, ' $1').trim()

            if (data.inconsistencies && data.inconsistencies.length > 0) {
              newAlerts.push({
                id: `inconsistency-${doc.id}`,
                type: "critical",
                title: `Profile Mismatch: ${docName}`,
                details: data.inconsistencies,
                icon: AlertOctagon
              })
            }

            if (data.risk_flags && data.risk_flags.length > 0) {
              newAlerts.push({
                id: `risk-${doc.id}`,
                type: "critical",
                title: `Risk Detected: ${docName}`,
                details: data.risk_flags,
                icon: AlertCircle
              })
            }

            if (data.missing_info && data.missing_info.length > 0) {
              newAlerts.push({
                id: `missing-${doc.id}`,
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

          setAlerts(newAlerts.slice(0, 5))
          setLoading(false)
        })
        return () => unsubscribeSnapshot()
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  if (loading) {
    return (
      <div className=" rounded-2xl shadow-md border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 h-[300px] animate-pulse"></div>
    )
  }

  return (
    <div id="alerts-warnings-card" className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-6 transition-all duration-300 hover:shadow-2xl group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">Alerts & Warnings</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Potential issues in your profile</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <div className="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 text-xs font-black px-3 py-1 rounded-full animate-bounce">
            {alerts.length} NEW
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
                  "border-l-4 rounded-lg",
                  {
                    "bg-red-50/50 dark:bg-red-900/20 border-l-red-500": alert.type === "critical",
                    "bg-amber-50/50 dark:bg-amber-900/20 border-l-amber-500": alert.type === "warning",
                  }
                )}
              >
                <AccordionTrigger className="hover:no-underline p-3">
                  <div className="flex items-center text-left gap-3">
                    <alert.icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      {
                        "text-red-500": alert.type === "critical",
                        "text-amber-500": alert.type === "warning",
                      }
                    )} />
                    <p className={cn(
                        "text-sm font-semibold",
                        {
                          "text-red-800 dark:text-red-300": alert.type === "critical",
                          "text-amber-800 dark:text-amber-300": alert.type === "warning",
                        }
                      )}>{alert.title}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-1 pb-2 px-4 pl-11">
                    <ul className={cn(
                      "list-disc space-y-1 text-xs",
                      {
                        "text-red-700 dark:text-red-300/80": alert.type === "critical",
                        "text-amber-700 dark:text-amber-300/80": alert.type === "warning",
                      }
                    )}>
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start">
              <Info className="text-blue-500 dark:text-blue-400 mr-3 mt-0.5 w-5 h-5" />
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">No Critical Alerts</p>
                <p className="text-xs text-blue-700 dark:text-blue-300/80">Great job! Your documents look good so far.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
