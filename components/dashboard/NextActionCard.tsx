"use client"

import { useState } from "react"
import { Bolt, CircleCheck, Circle, Sparkles } from "lucide-react"
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal"
import { DocumentReviewModal } from "@/components/dashboard/DocumentReviewModal"
import { Button } from "@/components/ui/button"
import { getRequiredDocuments } from "@/utils/documentConfig"
import { useDashboardData } from "@/context/DashboardDataContext"


export function NextActionCard() {
  const { userData, loading } = useDashboardData()
  const [reviewDoc, setReviewDoc] = useState<{ key: string, url: string, label: string, type: string } | null>(null)

  const requiredDocuments = getRequiredDocuments(userData?.onboarding?.visaType);
  const uploadedDocs: Record<string, any> = userData?.documents || {}

  const nextPendingDoc = requiredDocuments.find(doc => !uploadedDocs[doc.key])

  if (loading) {
    return (
      <div className="h-[300px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>
    )
  }

  return (
    <div id="next-action-card" className="group rounded-[1.5rem] border border-lp-line bg-lp-card p-6 text-lp-fg lp-shadow">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lp-sky transition-transform duration-300 group-hover:-rotate-6">
          <Bolt className="h-5 w-5 text-lp-azure" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.03em]">Next Action</h2>
          <p className="text-xs text-lp-muted">Your personalized checklist</p>
        </div>
      </div>
      
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-lp-navy p-5 text-white">
        <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.15]" aria-hidden="true"></div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#5DBF95]/25 blur-2xl" aria-hidden="true"></div>
        <p className="relative z-10 mb-4 font-display font-semibold leading-snug tracking-tight">
          {nextPendingDoc 
            ? `Next step: Upload your ${nextPendingDoc.label}`
            : "All documents uploaded! You are ready for the next stage."}
        </p>
        <div className="relative z-10">
          <UploadDocumentsModal variant="white"/>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[250px] space-y-1 overflow-y-auto pr-1">
        {requiredDocuments.map((doc) => {
          const docData = uploadedDocs[doc.key]
          const isUploaded = !!docData
          
          // Handle legacy string URLs vs new object structure
          const docUrl = typeof docData === 'string' ? docData : docData?.url
          const docType = typeof docData === 'string' ? 'application/pdf' : (docData?.type || 'application/pdf')

          return (
            <div key={doc.key} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm transition-colors hover:bg-lp-card-2">
              <div className="flex min-w-0 items-start">
                {isUploaded ? (
                  <CircleCheck className="mr-2.5 mt-0.5 h-4 w-4 flex-shrink-0 text-lp-azure" />
                ) : (
                  <Circle className="mr-2.5 mt-0.5 h-4 w-4 flex-shrink-0 text-lp-fg/25" />
                )}
                <span className={isUploaded ? "text-lp-fg" : "text-lp-muted"}>
                  {doc.label} <span className="text-lp-muted">{isUploaded ? "uploaded" : "pending"}</span>
                </span>
              </div>
              
              {isUploaded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 shrink-0 rounded-full bg-lp-sky px-3 text-xs font-semibold text-lp-azure hover:bg-lp-azure hover:text-white"
                  onClick={() => setReviewDoc({ key: doc.key, url: docUrl, label: doc.label, type: docType })}
                >
                  <Sparkles className="mr-1 h-3 w-3" /> Review
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {reviewDoc && (
        <DocumentReviewModal 
          isOpen={!!reviewDoc}
          onClose={() => setReviewDoc(null)}
          documentUrl={reviewDoc.url}
          documentType={reviewDoc.key}
          documentLabel={reviewDoc.label}
          mimeType={reviewDoc.type}
        />
      )}
    </div>
  )
}
