"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { DashboardDataProvider } from "@/context/DashboardDataContext"
import { useReadiness } from "@/hooks/useReadiness"
import { WelcomeCard } from "./WelcomeCard"
import { QuickStats } from "./QuickStats"
import { ReadinessPanel } from "./ReadinessPanel"
import { ProgressTracker } from "./ProgressTracker"
import { NextActionCard } from "./NextActionCard"
import { AlertsSection } from "./AlertsSection"
import { ResourcesSection } from "./ResourcesSection"
import { OutcomeCard } from "./OutcomeCard"
import { EnablePushPrompt } from "./EnablePushPrompt"
import { SidePanel } from "./home/SidePanel"

/**
 * Dashboard home, top to bottom:
 *   1. Welcome + next step, then cards that only show when relevant
 *   2. Summary stats row
 *   3. Main column: what to do next (readiness) and the journey;
 *      side column: documents, alerts, coming up / recent
 *   4. Quick actions
 * On phones the columns stack in that order, most actionable first.
 * Every widget reads the shared readiness data (DashboardDataProvider).
 */
export function DashboardContent() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".dashboard-section", { opacity: 0, y: 24, duration: 0.8, stagger: 0.08, ease: "expo.out" })
        }, containerRef)
        return () => ctx.revert()
    }, [])

    return (
        <DashboardDataProvider>
            <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-lp-page text-lp-fg">
                {/* Soft wash of brand colour behind the top of the page. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-lp-sky via-lp-sky/30 to-transparent" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" aria-hidden="true" />
                <div className="relative mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 md:px-6 md:py-8 lg:px-8">
                    <div className="dashboard-section">
                        <WelcomeCard />
                    </div>

                    {/* Only shown when relevant: after the interview, or before push is on. */}
                    <OutcomeCard />
                    <EnablePushPrompt />

                    <div className="dashboard-section">
                        <QuickStats />
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div className="dashboard-section">
                                <ReadinessPanel showAppointment={false} maxSteps={5} />
                            </div>
                            <div className="dashboard-section">
                                <ProgressTracker />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="dashboard-section">
                                <NextActionCard />
                            </div>
                            <div className="dashboard-section">
                                <AlertsSection />
                            </div>
                            <div className="dashboard-section">
                                <ComingUp />
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <ResourcesSection />
                    </div>
                </div>
            </div>
        </DashboardDataProvider>
    )
}

/** Appointment, booked live sessions and recent notifications. */
function ComingUp() {
    const { appointment, now } = useReadiness()
    return <SidePanel appointment={appointment} now={now} />
}
