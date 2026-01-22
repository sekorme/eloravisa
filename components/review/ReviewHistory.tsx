"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Upload, FileText, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { AIReviewResults } from "@/components/review/AIReviewResults";

type ReviewItem = {
    id: string;
    date: string;
    docType: string;
    summary: string;
    tips: string[];
};

const sampleReviews: ReviewItem[] = [
    {
        id: "r1",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        docType: "Statement of Purpose (SOP)",
        summary: "Good structure; missing specific timeline for studies and funding clarity.",
        tips: [
            "Add a concise timeline for coursework and milestones.",
            "Specify exact funding sources and amounts.",
            "Avoid vague phrases like \"financially stable\" without evidence."
        ]
    },
    {
        id: "r2",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        docType: "Proof of Funds",
        summary: "Bank statements present but need clearer provenance.",
        tips: [
            "Include a signed letter from account holder if different.",
            "Highlight recurring income or savings history if available."
        ]
    },
    {
        id: "r3",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        docType: "Sponsor Letter",
        summary: "Sponsor relationship clear; letter lacks contact details.",
        tips: [
            "Add full contact info of sponsor and relationship proof.",
            "Include sponsor's bank or employment verification."
        ]
    }
];

export function ReviewHistory({ reviews }: { reviews: ReviewItem[] }) {
    return (
        <div className="review-section">
            <Card className="p-6 bg-white dark:bg-card border-slate-200 dark:border-border">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review History</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{reviews.length} recent</p>
                </div>

                <div className="space-y-4">
                    {reviews.map((r) => (
                        <div key={r.id} className="p-4 rounded-lg border border-slate-100 dark:border-border bg-slate-50 dark:bg-transparent">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.docType}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(r.date).toLocaleString()}</p>
                                </div>
                            </div>

                            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{r.summary}</p>

                            <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tips</p>
                                <ul className="list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                    {r.tips.map((tip, idx) => (
                                        <li key={idx}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default function AIDocumentReviewPage() {
    const [reviewing, setReviewing] = useState(false);
    const [reviewComplete, setReviewComplete] = useState(false);
    const [history, setHistory] = useState<ReviewItem[]>(sampleReviews);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".review-section", {
                opacity: 0,
                y: 20,
                duration: 0.5,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "all"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const startReview = () => {
        setReviewing(true);
        setReviewComplete(false);
        // Simulate AI processing
        setTimeout(() => {
            setReviewing(false);
            setReviewComplete(true);

            // Simulate adding a new review to history
            const newReview: ReviewItem = {
                id: `r${Date.now()}`,
                date: new Date().toISOString(),
                docType: "Uploaded Document",
                summary: "Auto-generated summary of uploaded document.",
                tips: [
                    "Review highlighted sections for clarity.",
                    "Provide more evidence for funding where applicable."
                ]
            };
            setHistory((prev) => [newReview, ...prev].slice(0, 10));

            // Animate results entrance
            setTimeout(() => {
                gsap.from(".results-entrance", {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    ease: "power3.out"
                });
            }, 50);
        }, 3000);
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
            <div ref={containerRef} className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="review-section">
                    <Card className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white border-none shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Sparkles size={120} />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <h1 className="text-3xl font-black tracking-tight">AI Document Review</h1>
                            </div>
                            <div className="space-y-1">
                                <p className="text-blue-100 text-lg font-medium">
                                    Get expert-level feedback before you submit to the embassy.
                                </p>
                                <div className="flex items-start gap-2 text-xs text-blue-200/80 bg-black/10 p-3 rounded-lg border border-white/5">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    <p>This provides educational guidance based on common refusal patterns. It is not an official guarantee of visa approval.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6 review-section">
                        {/* Configuration Card */}
                        <Card className="p-6 space-y-4 bg-white dark:bg-card border-slate-200 dark:border-border">
                            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                Configuration
                            </h2>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Document type</p>
                                <Select>
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue placeholder="Select document type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sop">Statement of Purpose (SOP)</SelectItem>
                                        <SelectItem value="funds">Proof of Funds</SelectItem>
                                        <SelectItem value="sponsor">Sponsor Letter</SelectItem>
                                        <SelectItem value="invitation">Invitation Letter</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Different documents are analyzed using specific embassy criteria.
                                </p>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* Upload Card */}
                        {!reviewComplete && (
                            <div className="review-section">
                                <Card className={`p-10 border-dashed border-2 text-center space-y-4 transition-all ${reviewing ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer'}`}>
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                                        <Upload className="text-blue-600 dark:text-blue-400" size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-lg dark:text-white">
                                            Click to upload or drag & drop
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            PDF, DOCX or JPEG (Max 10MB)
                                        </p>
                                    </div>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 shadow-lg shadow-blue-500/20"
                                        onClick={startReview}
                                        disabled={reviewing}
                                    >
                                        {reviewing ? (
                                            <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={18} />
                                    Reviewing...
                                </span>
                                        ) : "Start AI Review"}
                                    </Button>
                                </Card>
                            </div>
                        )}

                        {/* Reviewing Progress */}
                        {reviewing && (
                            <div className="review-section">
                                <Card className="p-8 space-y-6 bg-white dark:bg-card border-blue-200 dark:border-blue-900 shadow-lg shadow-blue-500/5 animate-pulse">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="font-bold text-slate-900 dark:text-white">Reviewing your document carefully…</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Our AI is checking for embassy-specific requirements.
                                            </p>
                                        </div>
                                        <Loader2 className="animate-spin text-blue-500" size={24} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                                            <span>Analyzing content</span>
                                            <span>70%</span>
                                        </div>
                                        <Progress value={70} className="h-2" />
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Results Section */}
                        {reviewComplete && !reviewing && (
                            <div className="results-entrance">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Analysis Results</h2>
                                    <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                        Review Complete
                                    </div>
                                </div>
                                <AIReviewResults />

                                {/* Review History shown below results */}
                                <div className="mt-6">
                                    <ReviewHistory reviews={history} />
                                </div>
                            </div>
                        )}

                        {/* If no results yet, still show history under uploader */}
                        {!reviewComplete && (
                            <div>
                                <ReviewHistory reviews={history} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
