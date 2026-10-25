"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import VisaHeader from "@/components/application/VisaHeader";
import ApplicationProgress from "@/components/application/ApplicationProgress";
import VisaCheckList from "@/components/application/VisaCheckList";
import EmbassyTips from "@/components/application/EmbassyTips";
import SupportTools from "@/components/application/SupportTools";
import Disclaimer from "@/components/application/Disclaimer";
import DocumentManager from "@/components/application/DocumentManager";

export default function MyVisaApplicationPage() {
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".app-section", {
                opacity: 0,
                y: 24,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
                clearProps: "all"
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <main ref={pageRef} className="min-h-screen w-full bg-lp-page text-lp-fg">
            <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
                <div className="app-section">
                    <VisaHeader />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="app-section">
                            <ApplicationProgress />
                        </div>
                        <div className="app-section">
                            <div className="mb-4 flex items-end justify-between gap-3 px-1">
                                <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] md:text-3xl">Requirements Checklist</h2>
                                <span className="shrink-0 rounded-full border border-lp-line bg-lp-card px-3 py-1 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">
                                    Step-by-step guidance
                                </span>
                            </div>
                            <VisaCheckList />
                        </div>

                    </div>

                    <div className="space-y-6">
                        <div className="app-section">
                            <EmbassyTips country="Ghana" />
                        </div>
                        <div className="app-section">
                            <SupportTools />
                        </div>
                        <div className="app-section">
                            <Disclaimer />
                        </div>
                        <div className="app-section">
                            <DocumentManager />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
