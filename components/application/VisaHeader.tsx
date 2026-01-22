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
            <Card className="p-6 md:p-8 h-[140px] animate-pulse bg-gray-100 dark:bg-gray-800 border-none shadow-sm"></Card>
        )
    }

    const destination = userData?.onboarding?.destination || "Your Destination"
    const visaType = userData?.onboarding?.visaType || "Visa Type"

    return (
        <Card className="relative overflow-hidden border-none shadow-lg bg-white dark:bg-slate-950">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-5 items-start">
                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-full p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transform transition-transform hover:scale-105 duration-300">
                        <FileText size={28} strokeWidth={1.5} className={"text-black dark:text-white"} />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                <MapPin size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Application</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                <Lock size={12} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Secure</span>
                            </div>
                        </div>
                        
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                {destination} <span className="text-slate-300 dark:text-slate-700 font-light mx-1">/</span> {visaType}
                            </h1>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                                Your personalized roadmap to success. Keep your documents updated to significantly increase your approval chances.
                            </p>
                        </div>
                    </div>
                </div>


                <div className="flex-end justify-end w-full">


                        <UploadDocumentsModal/>

                </div>
            </div>
        </Card>
    );
}
