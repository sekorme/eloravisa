"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, AlertCircle, Sparkles, Quote } from "lucide-react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { ReviewDetails } from "./ReviewDetails";
import { DocumentReviewModal } from "@/components/dashboard/DocumentReviewModal";
import { UploadDocumentsModal } from "@/components/UploadDocumentsModal";

interface ChecklistItemProps {
    index: number;
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
    index,
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
    const panelId = useId();

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

    const getStatusLabel = () => {
        if (status === "completed") return "Completed";
        if (status === "in-progress") {
            if (reviewData) return "Needs Improvement";
            return "Uploaded";
        }
        return "Not Started";
    }

    const statusPill = {
        "completed": "bg-lp-sky text-lp-azure",
        "in-progress": reviewData
            ? "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
            : "bg-lp-navy text-white dark:bg-lp-navy-2",
        "not-started": "border border-lp-line text-lp-muted",
    }[status];

    const number = String(index + 1).padStart(2, "0");

    return (
        <>
            <div
                className={cn(
                    "group overflow-hidden rounded-[1.25rem] border bg-lp-card text-lp-fg transition-[border-color,box-shadow] duration-300",
                    open ? "border-lp-azure/30 lp-shadow" : "border-lp-line hover:border-lp-fg/20"
                )}
            >
                <button
                    type="button"
                    onClick={toggle}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lp-azure md:gap-5 md:p-5"
                >
                    {/* Step marker: number until uploaded, then a check (green when approved) */}
                    <div
                        className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors duration-300",
                            status === "completed" && "bg-lp-azure text-white",
                            status === "in-progress" && "bg-lp-navy text-[#8FCDAF] dark:bg-lp-navy-2",
                            status === "not-started" && "border border-lp-line bg-lp-card-2 text-lp-muted"
                        )}
                    >
                        {isUploaded ? <Check className="h-5 w-5 stroke-[2.5]" /> : number}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h4 className="font-display text-base font-semibold leading-tight tracking-[-0.02em] md:text-lg">{title}</h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={cn("rounded-full px-2.5 py-0.5 font-display text-[10px] font-medium uppercase tracking-[0.14em]", statusPill)}>
                                {getStatusLabel()}
                            </span>
                            {isUploaded && !reviewData && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-lp-sky px-2.5 py-0.5 font-display text-[10px] font-medium uppercase tracking-[0.14em] text-lp-azure">
                                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                                    Ready for AI
                                </span>
                            )}
                            {reviewData && typeof reviewData.score === "number" && (
                                <span className="font-display text-[11px] font-semibold text-lp-muted">
                                    Score <span className="text-lp-fg">{reviewData.score}</span>/100
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300",
                            open ? "rotate-180 bg-lp-navy text-white" : "border border-lp-line text-lp-muted group-hover:text-lp-fg"
                        )}
                        aria-hidden="true"
                    >
                        <ChevronDown size={16} />
                    </div>
                </button>

                <div ref={contentRef} id={panelId} className="h-0 overflow-hidden opacity-0">
                    <div className="space-y-6 border-t border-lp-line p-5 md:p-6 md:pl-[5.25rem]">

                        {reviewData ? (
                            <ReviewDetails reviewData={reviewData} />
                        ) : (
                            <div className="grid gap-5">
                                <div className="space-y-2">
                                    <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">Why it matters</p>
                                    <p className="text-sm leading-relaxed text-lp-muted">{explanation}</p>
                                </div>

                                {example && (
                                    <figure className="relative overflow-hidden rounded-2xl bg-lp-navy p-5 text-white">
                                        <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
                                        <Quote className="relative mb-3 h-5 w-5 text-[#8FCDAF]" aria-hidden="true" />
                                        <figcaption className="relative mb-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
                                            Pro Example
                                        </figcaption>
                                        <blockquote className="relative text-sm leading-relaxed text-white/85">{example}</blockquote>
                                    </figure>
                                )}

                                {mistakes.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-red-600 dark:text-red-300">Common Pitfalls</p>
                                        <ul className="grid gap-2 sm:grid-cols-2">
                                            {mistakes.map((m: string) => (
                                                <li key={m} className="flex items-start gap-2.5 rounded-xl border border-lp-line bg-lp-card-2 p-3 text-sm text-lp-muted">
                                                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500 dark:text-red-300" aria-hidden="true" />
                                                    <span className="leading-snug">{m}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {(!isUploaded || !reviewData) && (
                            <div className="flex flex-col gap-3 border-t border-lp-line pt-5 sm:flex-row">
                                {!isUploaded ? (
                                    <div className="w-full sm:w-auto sm:min-w-[240px]">
                                        <UploadDocumentsModal />
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="h-12 gap-3 rounded-full bg-lp-azure pl-1.5 pr-6 font-semibold text-white transition-[background-color,transform] hover:bg-lp-azure-2 motion-safe:hover:-translate-y-0.5 sm:w-auto"
                                    >
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15" aria-hidden="true">
                                            <Sparkles size={16} />
                                        </span>
                                        Review with AI Analysis
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
