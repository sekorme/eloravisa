"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Lock, FileText, MapPin, Plane } from "lucide-react"
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { cn } from "@/lib/utils"

export default function VisaHeader() {
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid)
                const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data())
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

    if (loading) {
        return (
            <Card className="p-6 md:p-8 h-[160px] animate-pulse bg-gray-100 dark:bg-gray-800 border-none shadow-sm rounded-3xl"></Card>
        )
    }

    const destination = userData?.onboarding?.destination || "Your Destination"
    const visaType = userData?.onboarding?.visaType || "Visa Type"

    return (
        <Card className="relative overflow-hidden border-none shadow-2xl rounded-3xl bg-white dark:bg-slate-950">
            {/* Multi-step Vibrant Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-500/5 to-purple-600/10 dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-purple-500/20" />
            
            {/* Animated Glow Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
            
            <div className="relative z-10 p-6 md:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/30 transform transition-transform hover:rotate-3 duration-300 shrink-0">
                        <FileText size={32} strokeWidth={1.5} />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 backdrop-blur-md">
                                <MapPin size={12} className="animate-bounce" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Application</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md">
                                <Lock size={12} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Encryption Active</span>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
                                {destination} <span className="text-blue-500/40 dark:text-blue-500/30 font-light">/</span> {visaType}
                            </h1>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
                                Your path to <span className="text-slate-900 dark:text-white font-bold">{destination}</span> starts here. Complete each step to maximize your approval odds.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex lg:justify-end w-full lg:w-auto">
                    <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/20 dark:border-white/10 shadow-xl shadow-black/5">
                        <UploadDocumentsModal />
                    </div>
                </div>
            </div>
        </Card>
    );
}
