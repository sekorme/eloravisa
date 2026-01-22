"use client"

import { useEffect, useState } from "react"
import { Bolt, CircleCheck, Circle, Sparkles } from "lucide-react"
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal"
import { DocumentReviewModal } from "@/components/dashboard/DocumentReviewModal"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"

const requiredDocuments = [
  { key: "passport", label: "Passport copy" },
  { key: "financialStatement", label: "Financial Statement" },
  { key: "statementOfPurpose", label: "Statement of Purpose" },
  { key: "travelItinerary", label: "Travel Itinerary" },
  { key: "proofOfAccommodation", label: "Proof of Accommodation" },
  { key: "purposeOfTravel", label: "Purpose of Travel" },
  { key: "homeTies", label: "Home Ties" },
]

export function NextActionCard() {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [reviewDoc, setReviewDoc] = useState<{ key: string, url: string, label: string, type: string } | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            setUploadedDocs(data.documents || {})
          }
          setLoading(false)
        })
        return () => unsubscribeSnapshot()
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  const nextPendingDoc = requiredDocuments.find(doc => !uploadedDocs[doc.key])

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6 h-[300px] animate-pulse"></div>
    )
  }

  return (
    <div id="next-action-card" className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-4 md:p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
          <Bolt className="text-blue-600 dark:text-blue-400 text-lg w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-foreground">Next Action</h2>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 mb-4 border border-blue-100 dark:border-blue-800">
        <p className="text-gray-800 dark:text-gray-200 font-medium mb-4">
          {nextPendingDoc 
            ? `Your next step: Upload your ${nextPendingDoc.label}`
            : "All documents uploaded! You are ready for the next stage."}
        </p>
        <UploadDocumentsModal/>
      </div>

      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
        {requiredDocuments.map((doc) => {
          const docData = uploadedDocs[doc.key]
          const isUploaded = !!docData
          
          // Handle legacy string URLs vs new object structure
          const docUrl = typeof docData === 'string' ? docData : docData?.url
          const docType = typeof docData === 'string' ? 'application/pdf' : (docData?.type || 'application/pdf')

          return (
            <div key={doc.key} className="flex items-center justify-between text-sm group">
              <div className="flex items-start">
                {isUploaded ? (
                  <CircleCheck className="text-green-500 mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />
                ) : (
                  <Circle className="text-gray-300 dark:text-gray-600 mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />
                )}
                <span className={isUploaded ? "text-gray-600 dark:text-gray-400" : "text-gray-500 dark:text-gray-500"}>
                  {doc.label} {isUploaded ? "uploaded" : "pending"}
                </span>
              </div>
              
              {isUploaded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20  transition-opacity"
                  onClick={() => setReviewDoc({ key: doc.key, url: docUrl, label: doc.label, type: docType })}
                >
                  <Sparkles className="w-3 h-3 mr-1" /> Review
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
