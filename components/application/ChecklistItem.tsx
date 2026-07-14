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
            <Card className={`overflow-hidden border-l-4 transition-all duration-500 group ${
                status === 'completed' ? 'border-l-emerald-500 shadow-emerald-500/5' : 
                status === 'in-progress' ? 'border-l-amber-500 shadow-amber-500/5' : 
                'border-l-slate-300 dark:border-l-slate-700'
            } bg-white dark:bg-slate-900 hover:shadow-xl hover:shadow-blue-500/5 border border-slate-200 dark:border-slate-800 rounded-2xl`}>
                <button
                    onClick={toggle}
                    className="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                    <div className="flex items-center gap-5">
                        <div className={`transition-transform duration-500 ${open ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {getStatusIcon()}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight text-lg tracking-tight">{title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-[0.15em] px-2 py-0.5 rounded-md ${getStatusStyles()}`}>
                                    {getStatusLabel()}
                                </Badge>
                                {isUploaded && !reviewData && (
                                    <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-[0.15em] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-none">
                                        Ready for AI
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-blue-500 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                        <ChevronDown size={16} />
                    </div>
                </button>

                <div ref={contentRef} className="overflow-hidden h-0 opacity-0">
                    <div className="p-8 pt-2 space-y-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                        
                        {reviewData ? (
                            <ReviewDetails reviewData={reviewData} />
                        ) : (
                            <div className="grid gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Why it matters</p>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-3.5">{explanation}</p>
                                </div>
                                
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100/50 dark:border-blue-800/50 relative overflow-hidden group/example">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/example:scale-110 transition-transform">
                                        <Sparkles size={24} className="text-blue-600" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={12} />
                                        Pro Example
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed leading-snug">"{example}"</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 dark:text-red-400">Common Pitfalls</p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3 pl-3.5">
                                        {mistakes.map((m: string) => (
                                            <div key={m} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-slate-600 dark:text-slate-400 group/pitfall">
                                                <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0 group-hover/pitfall:scale-110 transition-transform" />
                                                <span className="font-medium leading-tight">{m}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            {!isUploaded ? (
                                <div className="w-full">
                                    <UploadDocumentsModal /> 
                                </div>
                            ) : (
                                <>
                                    {!reviewData && (
                                        <Button 
                                            onClick={() => setIsReviewModalOpen(true)}
                                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-none gap-3 shadow-xl shadow-blue-500/25 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            <Sparkles size={18} />
                                            <span className="font-bold tracking-tight">Review with AI Analysis</span>
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
