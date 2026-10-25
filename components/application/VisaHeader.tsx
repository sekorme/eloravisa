"use client"

import { useState, useEffect } from "react"
import { Lock, FileText, MapPin, Plane } from "lucide-react"
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function VisaHeader() {
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // onAuthStateChanged ignores the callback's return value — clean up by hand.
        let unsubscribeSnapshot: (() => void) | undefined
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubscribeSnapshot?.()
            unsubscribeSnapshot = undefined
            if (user) {
                const userDocRef = doc(db, "users", user.uid)
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data())
                    }
                    setLoading(false)
                })
            } else {
                setLoading(false)
            }
        })

        return () => {
            unsubscribeSnapshot?.()
            unsubscribeAuth()
        }
    }, [])

    if (loading) {
        return (
            <div className="h-[200px] animate-pulse rounded-[2rem] bg-lp-card-2"></div>
        )
    }

    const destination = userData?.onboarding?.destination || "Your Destination"
    const visaType = userData?.onboarding?.visaType || "Visa Type"

    return (
        <div className="relative overflow-hidden rounded-[2rem] bg-lp-navy text-white lp-shadow">
            <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#5DBF95]/20 blur-3xl" aria-hidden="true" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 p-6 md:p-10 lg:flex-row lg:items-center">
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#8FCDAF] ring-1 ring-white/10">
                        <FileText size={26} strokeWidth={1.75} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/85">
                                <MapPin size={12} className="text-[#8FCDAF]" />
                                Live Application
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/85">
                                <Lock size={12} className="text-[#8FCDAF]" />
                                Encryption Active
                            </span>
                        </div>

                        <div>
                            <h1 className="mb-3 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-5xl">
                                {destination} <span className="font-normal text-white/30">/</span> <span className="text-[#8FCDAF]">{visaType}</span>
                            </h1>
                            <p className="max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
                                Your path to <span className="font-semibold text-white">{destination}</span> starts here. Complete each step to maximize your approval odds.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-auto">
                    <UploadDocumentsModal variant="white" className="sm:min-w-[220px]" />
                </div>
            </div>
        </div>
    );
}
