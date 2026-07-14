"use client"

import { useEffect, useState } from "react"
import { Bolt, CircleCheck, Circle, Sparkles } from "lucide-react"
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal"
import { DocumentReviewModal } from "@/components/dashboard/DocumentReviewModal"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { getRequiredDocuments } from "@/utils/documentConfig"


export function NextActionCard() {
  const [userData, setUserData] = useState<any>(null)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [reviewDoc, setReviewDoc] = useState<{ key: string, url: string, label: string, type: string } | null>(null)

  const requiredDocuments = getRequiredDocuments(userData?.onboarding?.visaType);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid)
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            setUserData(data)
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
    <div id="next-action-card" className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 p-6 transition-all duration-300 hover:shadow-2xl group">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mr-4 group-hover:rotate-12 transition-transform duration-300">
          <Bolt className="text-blue-600 dark:text-blue-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-neutral-800 dark:text-neutral-100 tracking-tight">Next Action</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Your personalized checklist</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-blue-200 dark:shadow-none relative overflow-hidden group/btn">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover/btn:scale-150 transition-transform duration-700"></div>
        <p className="font-bold mb-4 relative z-10 leading-snug">
          {nextPendingDoc 
            ? `Next step: Upload your ${nextPendingDoc.label}`
            : "All documents uploaded! You are ready for the next stage."}
        </p>
        <div className="relative z-10">
          <UploadDocumentsModal/>
        </div>
      </div>

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
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
