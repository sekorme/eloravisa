"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, CheckCircle2, Circle, AlertCircle, Sparkles, Upload } from "lucide-react";
import { gsap } from "gsap";
import { Badge } from "@/components/ui/badge";
import { ReviewDetails } from "./ReviewDetails";
import { DocumentReviewModal } from "@/components/dashboard/DocumentReviewModal";
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal";

interface ChecklistItemProps {
    docKey: string;
    title: string;
    explanation: string;
    example: string;
    mistakes: string[];
    isUploaded: boolean;
    documentUrl?: string;
    mimeType?: string;
    reviewData?: any;
}

export default function ChecklistItem({
    docKey,
    title,
    explanation,
    example,
    mistakes,
    isUploaded,
    documentUrl,
    mimeType,
    reviewData,
}: ChecklistItemProps) {
    const [open, setOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggle = () => {
        setOpen(!open);
        gsap.to(contentRef.current, {
            height: open ? 0 : "auto",
            opacity: open ? 0 : 1,
            duration: 0.4,
            ease: "power3.out",
        });
    };

    // Determine status
    let status: "completed" | "in-progress" | "not-started" = "not-started";
    if (isUploaded) {
        if (reviewData) {
            status = reviewData.score >= 80 ? "completed" : "in-progress";
        } else {
            status = "in-progress";
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case "in-progress":
                return <AlertCircle className="w-5 h-5 text-amber-500" />;
            default:
                return <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />;
        }
    };

    const getStatusStyles = () => {
        switch (status) {
            case "completed":
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800";
            case "in-progress":
                return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800";
            default:
                return "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-100 dark:border-slate-700";
        }
    };

    const getStatusLabel = () => {
        if (status === "completed") return "Completed";
        if (status === "in-progress") {
            if (reviewData) return "Needs Improvement";
            return "Uploaded";
        }
        return "Not Started";
    }

    return (
        <>
            <Card className={`overflow-hidden border-l-4 transition-all duration-300 ${
                status === 'completed' ? 'border-l-emerald-500' : 
                status === 'in-progress' ? 'border-l-amber-500' : 
                'border-l-slate-300 dark:border-l-slate-700'
            } bg-white dark:bg-card hover:shadow-md border border-slate-200 dark:border-border`}>
                <button
                    onClick={toggle}
                    className="flex items-center justify-between w-full p-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                >
                    <div className="flex items-center gap-4">
                        {getStatusIcon()}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{title}</h4>
                            <Badge variant="outline" className={`mt-1.5 text-[10px] uppercase font-bold tracking-wider ${getStatusStyles()}`}>
                                {getStatusLabel()}
                            </Badge>
                        </div>
                    </div>
                    <ChevronDown
                        size={20}
                        className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-blue-500" : ""}`}
                    />
                </button>

                <div ref={contentRef} className="overflow-hidden h-0 opacity-0 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="p-6 pt-2 space-y-6 border-t border-slate-100 dark:border-slate-800">
                        
                        {reviewData ? (
                            <ReviewDetails reviewData={reviewData} />
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Why it matters</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{explanation}</p>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Pro Example</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">{example}</p>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-widest text-red-500 dark:text-red-400">Common Pitfalls</p>
                                    <ul className="space-y-2">
                                        {mistakes.map((m: string) => (
                                            <li key={m} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            {!isUploaded ? (
                                <div className="w-full">
                                    <UploadDocumentsModal /> 
                                </div>
                            ) : (
                                <>
                                    {!reviewData && (
                                        <Button 
                                            onClick={() => setIsReviewModalOpen(true)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 shadow-lg shadow-blue-500/20"
                                        >
                                            <Sparkles size={16} />
                                            Review with AI
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {isUploaded && documentUrl && (
                <DocumentReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    documentUrl={documentUrl}
                    documentType={docKey}
                    documentLabel={title}
                    mimeType={mimeType || 'application/pdf'}
                />
            )}
        </>
    );
}
