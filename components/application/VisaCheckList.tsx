"use client"

import { useState, useEffect } from "react"
import ChecklistItem from "./ChecklistItem"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, collection } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

const checklistData = [
    {
        key: "passport",
        title: "Valid Passport",
        explanation: "Your passport must be valid for your entire stay plus usually 6 months.",
        example: "Must be valid at least 6 months beyond your intended travel date with 2 blank pages.",
        mistakes: ["Expired passport", "Damaged pages", "Name mismatch"]
    },
    {
        key: "financialStatement",
        title: "Proof of Funds",
        explanation: "This shows you can support yourself without working illegally.",
        example: "6 months bank statement with consistent balances covering tuition + living expenses.",
        mistakes: ["Sudden large deposits", "Unclear sponsor source", "Short statement duration"]
    },
    {
        key: "statementOfPurpose",
        title: "Statement of Purpose (SOP)",
        explanation: "This explains why you chose this course and country.",
        example: "Clear study plan linked to your background and future career goals.",
        mistakes: ["Copy-paste templates", "No career connection", "Contradicting documents"]
    },
    {
        key: "travelItinerary",
        title: "Travel Itinerary",
        explanation: "Proof of your travel plans.",
        example: "Flight reservation showing entry and exit dates.",
        mistakes: ["Booking actual tickets before visa approval", "Dates mismatch with application"]
    },
    {
        key: "proofOfAccommodation",
        title: "Proof of Accommodation",
        explanation: "Where you will stay upon arrival.",
        example: "Hotel booking or invitation letter from a host.",
        mistakes: ["Unconfirmed booking", "Address mismatch"]
    },
    {
        key: "purposeOfTravel",
        title: "Purpose of Travel",
        explanation: "Evidence supporting your reason for visiting.",
        example: "Admission letter from university or invitation letter for business.",
        mistakes: ["Vague purpose", "Invalid documents"]
    },
    {
        key: "homeTies",
        title: "Home Ties",
        explanation: "Proof that you will return to your home country.",
        example: "Employment letter, property deeds, or family certificates.",
        mistakes: ["No strong ties shown", "Implied intent to immigrate permanently"]
    }
]

export default function VisaCheckList() {
    const [documents, setDocuments] = useState<Record<string, any>>({})
    const [reviews, setReviews] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Listen to user document for uploads
                const userDocRef = doc(db, "users", user.uid)
                const unsubUser = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        setDocuments(data.documents || {})
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

    return (
        <section className="space-y-4">
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
                        explanation={item.explanation}
                        example={item.example}
                        mistakes={item.mistakes}
                        isUploaded={isUploaded}
                        documentUrl={docUrl}
                        mimeType={mimeType}
                        reviewData={reviews[item.key]}
                    />
                )
            })}
        </section>
    );
}
