"use client"

import { useEffect, useRef, useState } from "react"
import { WelcomeCard } from "./WelcomeCard"
import { AlertsSection } from "./AlertsSection"
import { ProgressTracker } from "./ProgressTracker"
import { NextActionCard } from "./NextActionCard"
import { QuickStats } from "./QuickStats"
import { ResourcesSection } from "./ResourcesSection"
import { MessageCircle, X } from "lucide-react"
import gsap from "gsap"
import { ChatInterface } from "@/components/ChatInterface"
import { DashboardChatWrapper } from "../DashboardChatWrapper"

export function DashboardContent() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isChatOpen, setIsChatOpen] = useState(false)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".dashboard-section", {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                ease: "power3.out"
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="relative p-2 md:p-4 w-full min-h-screen">

            {/* Dashboard Sections */}
            <div className="dashboard-section">
                <WelcomeCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

            {/* Floating Chat */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
                <DashboardChatWrapper />
            </div>
        </div>
    )
}
