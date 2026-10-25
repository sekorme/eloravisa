"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, FileText, Trash2 } from "lucide-react"
import { auth, db } from "@/firebase/client"
import { doc, onSnapshot, updateDoc, deleteField, deleteDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const documentLabels: Record<string, string> = {
    passport: "Passport",
    financialStatement: "Financial Statement",
    statementOfPurpose: "Statement of Purpose",
    travelItinerary: "Travel Itinerary",
    proofOfAccommodation: "Proof of Accommodation",
    purposeOfTravel: "Purpose of Travel",
    homeTies: "Home Ties",
}

export default function DocumentManager() {
    const [documents, setDocuments] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        // onAuthStateChanged ignores the callback's return value — clean up by hand.
        let unsubscribeSnapshot: (() => void) | undefined
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            unsubscribeSnapshot?.()
            unsubscribeSnapshot = undefined
            if (currentUser) {
                setUser(currentUser)
                const userDocRef = doc(db, "users", currentUser.uid)
                unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        setDocuments(data.documents || {})
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

    const handleDelete = async (key: string) => {
        if (!user) return

        try {
            // 1. Remove from documents map
            const userDocRef = doc(db, "users", user.uid)
            await updateDoc(userDocRef, {
                [`documents.${key}`]: deleteField()
            })

            // 2. Delete review subcollection document
            const reviewDocRef = doc(db, "users", user.uid, "reviews", key)
            await deleteDoc(reviewDocRef)

            toast.success("Document deleted successfully")

        } catch (error) {
            console.error("Error deleting document:", error)
            toast.error("Failed to delete document")
        }
    }

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback to opening in new tab
            window.open(url, '_blank');
        }
    }

    if (loading) {
        return <div className="h-40 animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2" />
    }

    const uploadedKeys = Object.keys(documents)

    if (uploadedKeys.length === 0) {
        return null // Don't show if no documents
    }

    return (
        <div className="rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold tracking-[-0.03em]">Uploaded Documents</h2>
                <span className="rounded-full bg-lp-sky px-2.5 py-0.5 font-display text-[11px] font-semibold text-lp-azure">{uploadedKeys.length}</span>
            </div>

            <div className="space-y-2.5">
                {uploadedKeys.map((key) => {
                    const docData = documents[key]
                    // Handle both old string URLs and new object structure for backward compatibility
                    const docUrl = typeof docData === 'string' ? docData : docData?.url

                    return (
                        <div key={key} className="flex flex-col justify-between gap-3 rounded-2xl border border-lp-line bg-lp-card-2 p-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lp-card text-lp-azure ring-1 ring-lp-line">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {documentLabels[key] || key}
                                    </p>
                                    <a 
                                        href={docUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-0.5 flex items-center gap-1 text-xs font-medium text-lp-azure hover:underline"
                                    >
                                        View Document <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(docUrl, documentLabels[key] || key)}
                                    className="h-8 flex-1 rounded-full border border-lp-line bg-lp-card text-xs font-semibold text-lp-fg hover:bg-lp-sky hover:text-lp-azure"
                                >
                                    <Download className="mr-1.5 h-3.5 w-3.5" />
                                    Download
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 flex-1 rounded-full border border-lp-line bg-lp-card text-xs font-semibold text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-400/10"
                                        >
                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="rounded-[1.5rem] border-lp-line bg-lp-card text-lp-fg">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-display tracking-[-0.03em]">Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the
                                                document and its associated AI review from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="rounded-full bg-red-600 text-white hover:bg-red-700" onClick={() => handleDelete(key)}>
                                                Continue
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
