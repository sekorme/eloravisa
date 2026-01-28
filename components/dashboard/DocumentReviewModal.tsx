"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, CheckCircle, XCircle, FileText, AlertOctagon } from "lucide-react"
import { analyzeDocument } from "@/action/ai"
import { doc, setDoc } from "firebase/firestore"
import { db, auth } from "@/firebase/client"
import { Progress } from "@/components/ui/progress"
import { getCurrentUserDetails } from "@/action/user"
import { toast } from "sonner"
import { TOKEN_COSTS, deductTokens } from "@/lib/subscriptions"
import { getDoc } from "firebase/firestore"

interface DocumentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    documentUrl: string
    documentType: string
    documentLabel: string
    mimeType: string
}

export function DocumentReviewModal({ isOpen, onClose, documentUrl, documentType, documentLabel, mimeType }: DocumentReviewModalProps) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleAnalyze = async () => {
        if (!auth.currentUser) return;
        
        setLoading(true)
        setError(null)
        try {
            // Check tokens
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            const tokens = userDoc.data()?.tokens || 0;

            if (tokens < TOKEN_COSTS.DOCUMENT_REVIEW) {
                toast.error("Insufficient tokens", {
                    description: `You need ${TOKEN_COSTS.DOCUMENT_REVIEW} tokens for a document review.`,
                    action: {
                        label: "Buy Tokens",
                        onClick: () => window.location.href = "/dashboard/subscription"
                    }
                });
                setLoading(false);
                return;
            }

            // Fetch user data first
            const userData = await getCurrentUserDetails()
            if (!userData) {
                const message = "Could not retrieve user profile for analysis."
                setError(message)
                toast.error(message)
                setLoading(false)
                return
            }

            const response = await analyzeDocument(documentUrl, documentLabel, userData, mimeType)
            
            if (response.success) {
                // Deduct tokens
                await deductTokens(auth.currentUser.uid, TOKEN_COSTS.DOCUMENT_REVIEW);
                
                setResult(response.data)
                // Save to Firestore
                if (auth.currentUser) {
                    await setDoc(doc(db, "users", auth.currentUser.uid, "reviews", documentType), {
                        ...response.data,
                        createdAt: new Date().toISOString()
                    })
                }
                toast.success("Document analysis complete")
            } else {
                const message = response.error || "Failed to analyze document"
                setError(message)
                toast.error(message)
            }
        } catch (err) {
            const message = "An unexpected error occurred"
            setError(message)
            toast.error(message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>AI Review: {documentLabel}</DialogTitle>
                    <DialogDescription>
                        Get instant feedback on your document to improve your visa application.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {!result && !loading && !error && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <FileText className="w-16 h-16 text-blue-500 opacity-50" />
                            <p className="text-center text-muted-foreground">
                                Click below to start the AI analysis. This may take a few seconds.
                            </p>
                            <Button onClick={handleAnalyze} size="lg" className="w-full sm:w-auto">
                                Start Analysis
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            <p className="text-sm text-muted-foreground">Analyzing your document...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center gap-3">
                            <XCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Score */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-lg">Overall Score</h3>
                                    <p className="text-sm text-muted-foreground">Based on visa requirements</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl font-bold text-blue-600">{result.score}/100</div>
                                    <div className="w-16">
                                        <Progress value={result.score} className="h-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" /> Summary
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                    {result.summary}
                                </p>
                            </div>

                            {/* Inconsistencies Alert */}
                            {result.inconsistencies?.length > 0 && (
                                <div className="p-4 border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
                                    <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                                        <AlertOctagon className="w-4 h-4" /> Profile Mismatches Detected
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-orange-800 dark:text-orange-300">
                                        {result.inconsistencies.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Analysis Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Strengths
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                                        {result.strengths?.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                                        {result.weaknesses?.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Risk Flags */}
                            {result.risk_flags?.length > 0 && (
                                <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                    <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Risk Flags
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-red-700 dark:text-red-300">
                                        {result.risk_flags.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Improvements */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                                <h4 className="font-semibold text-blue-600 mb-2">Improvement Suggestions</h4>
                                <ul className="text-sm space-y-2">
                                    {result.improvement_suggestions?.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-blue-500 font-bold">•</span>
                                            <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
