"use client"

import { useState, useEffect } from "react"
import ChecklistItem from "./ChecklistItem"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getRequiredDocuments } from "@/utils/documentConfig"

export default function VisaCheckList() {
    const [documents, setDocuments] = useState<Record<string, any>>({})
    const [reviews, setReviews] = useState<Record<string, any>>({})
    const [visaType, setVisaType] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Listen to user document for uploads and visaType
                const userDocRef = doc(db, "users", user.uid)
                const unsubUser = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        setDocuments(data.documents || {})
                        setVisaType(data.onboarding?.visaType)
                    }
                })

                // Listen to reviews subcollection
                const reviewsCollRef = collection(db, "users", user.uid, "reviews")
                const unsubReviews = onSnapshot(reviewsCollRef, (snapshot) => {
                    const reviewsData: Record<string, any> = {}
                    snapshot.forEach((doc) => {
                        reviewsData[doc.id] = doc.data()
                    })
                    setReviews(reviewsData)
                    setLoading(false)
                })

                return () => {
                    unsubUser()
                    unsubReviews()
                }
            } else {
                setLoading(false)
            }
        })

        return () => unsubscribeAuth()
    }, [])

    if (loading) {
        return <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
        </div>
    }

    const checklistData = getRequiredDocuments(visaType)
    const uploadedCount = checklistData.filter(item => !!documents[item.key]).length;

    return (
        <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                <div>
                    <h3 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-2">
                        Requirements Masterlist
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-slate-900 dark:text-white">
                            {uploadedCount}
                        </p>
                        <p className="text-lg font-bold text-slate-400">
                            / {checklistData.length} <span className="text-xs font-medium ml-1">Documents Uploaded</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Status</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                            {Math.round(checklistData.length > 0 ? (uploadedCount / checklistData.length) * 100 : 0)}%
                        </span>
                    </div>
                    <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50 p-0.5">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                            style={{ width: `${checklistData.length > 0 ? (uploadedCount / checklistData.length) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {checklistData.map((item) => {
                    const docData = documents[item.key]
                    const isUploaded = !!docData
                    const docUrl = typeof docData === 'string' ? docData : docData?.url
                    const mimeType = typeof docData === 'string' ? 'application/pdf' : docData?.type

                    return (
                        <ChecklistItem
                            key={item.key}
                            docKey={item.key}
                            title={item.title}
                            explanation={item.explanation || ""}
                            example={item.example || ""}
                            mistakes={item.mistakes || []}
                            isUploaded={isUploaded}
                            documentUrl={docUrl}
                            mimeType={mimeType}
                            reviewData={reviews[item.key]}
                        />
                    )
                })}
            </div>
        </section>
    );
}
