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
        // onAuthStateChanged ignores the callback's return value, so the
        // Firestore listeners are torn down by hand on user change/unmount.
        let unsubData: (() => void) | undefined
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubData?.()
            unsubData = undefined
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

                unsubData = () => {
                    unsubUser()
                    unsubReviews()
                }
            } else {
                setLoading(false)
            }
        })

        return () => {
            unsubData?.()
            unsubscribeAuth()
        }
    }, [])

    if (loading) {
        return <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-[84px] rounded-[1.25rem] border border-lp-line bg-lp-card-2" />
            ))}
        </div>
    }

    const checklistData = getRequiredDocuments(visaType)
    const uploadedCount = checklistData.filter(item => !!documents[item.key]).length;
    const completion = Math.round(checklistData.length > 0 ? (uploadedCount / checklistData.length) * 100 : 0)

    return (
        <section className="space-y-5">
            <div className="flex flex-col justify-between gap-5 rounded-[1.5rem] border border-lp-line bg-lp-card p-5 text-lp-fg md:flex-row md:items-center md:p-6 lp-shadow">
                <div>
                    <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">
                        Requirements Masterlist
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="font-display text-4xl font-semibold tracking-[-0.05em]">
                            {uploadedCount}
                        </p>
                        <p className="font-display text-lg font-semibold text-lp-muted">
                            / {checklistData.length}
                        </p>
                        <span className="ml-1 text-sm text-lp-muted">Documents Uploaded</span>
                    </div>
                </div>

                <div className="w-full md:w-64">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">Completion Status</span>
                        <span className="font-display text-sm font-semibold">{completion}%</span>
                    </div>
                    {/* One segment per required document */}
                    <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion} aria-label="Documents uploaded">
                        {checklistData.map((item) => (
                            <span
                                key={item.key}
                                className={`h-2 flex-1 rounded-full transition-colors duration-500 ${documents[item.key] ? "bg-lp-azure" : "bg-lp-sky"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-3">
                {checklistData.map((item, index) => {
                    const docData = documents[item.key]
                    const isUploaded = !!docData
                    const docUrl = typeof docData === 'string' ? docData : docData?.url
                    const mimeType = typeof docData === 'string' ? 'application/pdf' : docData?.type

                    return (
                        <ChecklistItem
                            key={item.key}
                            index={index}
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
