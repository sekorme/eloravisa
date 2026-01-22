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
        <main ref={pageRef} className="min-h-screen p-2 md:p-6 w-full ">
            <div className="space-y-8">
                <div className="app-section">
                    <VisaHeader />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="app-section">
                            <ApplicationProgress />
                        </div>
                        <div className="app-section">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Requirements Checklist</h2>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                    Step-by-step guidance
                                </span>
                            </div>
                            <VisaCheckList />
                        </div>

                    </div>

                    <div className="space-y-8">
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
