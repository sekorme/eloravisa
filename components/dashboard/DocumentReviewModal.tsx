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
import { TOKEN_COSTS } from "@/lib/subscriptions"
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
            // Balance pre-check for UX only — the actual charge happens
            // server-side in analyzeDocument (action/ai.ts).
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

            const idToken = await auth.currentUser?.getIdToken()
            if (!idToken) {
                setError("Please sign in again to analyze documents.")
                setLoading(false)
                return
            }
            const response = await analyzeDocument(idToken, documentUrl, documentLabel, userData, mimeType)
            
            if (response.success) {
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
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col gap-0 overflow-hidden rounded-[1.5rem] border-lp-line bg-lp-card p-0 text-lp-fg">
                <DialogHeader className="border-b border-lp-line p-6">
                    <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">AI Review</span>
                    <DialogTitle className="font-display text-xl font-semibold tracking-[-0.03em]">{documentLabel}</DialogTitle>
                    <DialogDescription className="text-lp-muted">
                        Get instant feedback on your document to improve your visa application.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {!result && !loading && !error && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lp-sky">
                                <FileText className="h-7 w-7 text-lp-azure" />
                            </div>
                            <p className="max-w-xs text-center text-sm text-lp-muted">
                                Click below to start the AI analysis. This may take a few seconds.
                            </p>
                            <Button onClick={handleAnalyze} size="lg" className="h-12 w-full rounded-full bg-lp-navy px-7 font-semibold text-white hover:bg-lp-navy-2 sm:w-auto">
                                Start Analysis
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-lp-azure" />
                            <p className="text-sm text-lp-muted">Analyzing your document...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/[0.06] dark:text-red-300">
                            <XCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Score */}
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-lp-navy p-5 text-white">
                                <div>
                                    <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">Overall Score</h3>
                                    <p className="mt-1 text-sm text-white/75">Based on visa requirements</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-display text-3xl font-semibold tracking-[-0.04em]">{result.score}<span className="text-base text-white/50">/100</span></div>
                                    <div className="w-16">
                                        <Progress value={result.score} className="h-1.5 bg-white/15 [&>*]:bg-[#8FCDAF]" />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div>
                                <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold">
                                    <FileText className="h-4 w-4 text-lp-azure" /> Summary
                                </h4>
                                <p className="rounded-xl border border-lp-line bg-lp-card-2 p-4 text-sm leading-relaxed text-lp-muted">
                                    {result.summary}
                                </p>
                            </div>

                            {/* Inconsistencies Alert */}
                            {result.inconsistencies?.length > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
                                    <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-amber-800 dark:text-amber-300">
                                        <AlertOctagon className="w-4 h-4" /> Profile Mismatches Detected
                                    </h4>
                                    <ul className="list-disc space-y-1 pl-4 text-sm text-amber-900/80 dark:text-amber-200/80">
                                        {result.inconsistencies.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Analysis Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="space-y-2 rounded-xl border border-lp-line p-4">
                                    <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-lp-azure">
                                        <CheckCircle className="w-4 h-4" /> Strengths
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-lp-muted">
                                        {result.strengths?.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="space-y-2 rounded-xl border border-lp-line p-4">
                                    <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-amber-700 dark:text-amber-300">
                                        <AlertTriangle className="w-4 h-4" /> Weaknesses
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-4 text-lp-muted">
                                        {result.weaknesses?.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Risk Flags */}
                            {result.risk_flags?.length > 0 && (
                                <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-400/20 dark:bg-red-400/[0.06]">
                                    <h4 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-red-700 dark:text-red-300">
                                        <AlertTriangle className="w-4 h-4" /> Risk Flags
                                    </h4>
                                    <ul className="list-disc space-y-1 pl-4 text-sm text-red-900/80 dark:text-red-200/80">
                                        {result.risk_flags.map((item: string, i: number) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Improvements */}
                            <div className="rounded-xl bg-lp-sky p-4">
                                <h4 className="mb-3 font-display text-sm font-semibold text-lp-fg">Improvement Suggestions</h4>
                                <ul className="text-sm space-y-2">
                                    {result.improvement_suggestions?.map((item: string, i: number) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lp-azure"></span>
                                            <span className="text-lp-fg/85">{item}</span>
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
