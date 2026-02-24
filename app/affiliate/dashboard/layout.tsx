"use server"

import React from "react"
import {SidebarProvider} from "@/components/ui/sidebar";

import {cookies} from "next/headers";
import {getGeminiKey} from "@/action/ai";

import {RegisterSW} from "@/components/RegisterSW";
import AffAppSidebar from "@/components/affiliate/AffAppSidebar";
import AffiliateNavbar from "@/components/affiliate/AffiliateNavbar";
import AffiliateDashboardGuard from "@/components/affiliate/guards/AffiliateDashboardGuard";

const Layout = async({children}:{children: React.ReactNode}) =>{
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    const keys = await getGeminiKey()
    return (
        <div>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AffAppSidebar />
                <main className=" w-full">
                    <AffiliateNavbar />
                    <div className="">
                        <RegisterSW/>
                        <AffiliateDashboardGuard>
                            {children}
                        </AffiliateDashboardGuard>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    )
}

export default Layout
