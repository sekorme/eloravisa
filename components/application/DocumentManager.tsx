"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
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
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                const userDocRef = doc(db, "users", currentUser.uid)
                const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        setDocuments(data.documents || {})
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
        return <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    }

    const uploadedKeys = Object.keys(documents)

    if (uploadedKeys.length === 0) {
        return null // Don't show if no documents
    }

    return (
        <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 relative">
                    <Image src="/file-docx.svg" alt="Documents" fill className="object-contain" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Uploaded Documents</h2>
            </div>

            <div className="space-y-4">
                {uploadedKeys.map((key) => {
                    const docData = documents[key]
                    // Handle both old string URLs and new object structure for backward compatibility
                    const docUrl = typeof docData === 'string' ? docData : docData?.url

                    return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-10 h-10 flex items-center justify-center">
                                    <Image src="/file-docx.svg" alt="File" width={20} height={20} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                                        {documentLabels[key] || key}
                                    </p>
                                    <a 
                                        href={docUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                    >
                                        View Document <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(docUrl, documentLabels[key] || key)}
                                    className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                    <Image src="/download.svg" alt="Download" width={12} height={12} className="w-3 h-3 mr-2" />
                                    Download
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Image src="/delete.svg" alt="Delete" width={12} height={12} className="w-3 h-3 mr-2" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the
                                                document and its associated AI review from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(key)}>
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
        </Card>
    )
}
