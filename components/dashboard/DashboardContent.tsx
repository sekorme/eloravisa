"use client"

import { useEffect, useRef } from "react"
import { WelcomeCard } from "./WelcomeCard"
import { AlertsSection } from "./AlertsSection"
import { ProgressTracker } from "./ProgressTracker"
import { NextActionCard } from "./NextActionCard"
import { QuickStats } from "./QuickStats"
import { ResourcesSection } from "./ResourcesSection"
import gsap from "gsap"
import { DashboardDataProvider } from "@/context/DashboardDataContext"



export function DashboardContent() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".dashboard-section", {
                opacity: 0,
                y: 24,
                duration: 0.8,
                stagger: 0.1,
                ease: "expo.out"
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <DashboardDataProvider>
            <div ref={containerRef} className="relative w-full min-h-screen bg-lp-page text-lp-fg">
                <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">

                {/* Dashboard Sections */}
                <div className="dashboard-section">
                    <WelcomeCard />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 dashboard-section">
                        <ProgressTracker />
                    </div>
                    <div className="space-y-6 dashboard-section">
                        <NextActionCard />
                        <AlertsSection />
                    </div>
                </div>

                <div className="dashboard-section">
                    <QuickStats />
                </div>

                <div className="dashboard-section">
                    <ResourcesSection />
                </div>
                </div>
            </div>
        </DashboardDataProvider>
    )
}
