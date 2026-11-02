import React from "react"
import {SidebarProvider} from "@/components/ui/sidebar";

import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import {cookies} from "next/headers";
import {RegisterSW} from "@/components/RegisterSW";
// Despite the name, this is the floating Elora AI assistant widget
// (Pro/Full-gated chat bubble), not marketing content — this layout is its
// only mount point.
import HomePageContent from "@/components/HomePageContent";
import LiveSessionPopup from "@/components/dashboard/LiveSessionPopup";
import FCMInitializer from "@/components/FCMInitializer";

// AuthProvider is intentionally NOT mounted here — the root layout already
// wraps the whole tree in it; a second mount duplicated every auth listener
// and its Firestore reads on each dashboard navigation.
const Layout = async({children}:{children: React.ReactNode}) =>{
    const cookieStore = await cookies()
    // Open (with labels) until the user collapses it; icon-only menus are
    // hard to learn for new users.
    const saved = cookieStore.get("sidebar_state")?.value
    const defaultOpen = saved === undefined ? true : saved === "true"
    return (
        <div className="dashboard-theme min-h-screen bg-lp-page text-lp-fg">
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <main className="w-full min-w-0 bg-lp-page">
                    <Navbar />
                    {/* Bottom room so the floating Ask Elora button never hides the end of a page. */}
                    <div className="pb-24">
                        <RegisterSW/>
                        <FCMInitializer/>
                        {children}
                        <HomePageContent/>
                        <LiveSessionPopup/>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    )
}


export default Layout