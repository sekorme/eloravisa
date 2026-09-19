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

// AuthProvider is intentionally NOT mounted here — the root layout already
// wraps the whole tree in it; a second mount duplicated every auth listener
// and its Firestore reads on each dashboard navigation.
const Layout = async({children}:{children: React.ReactNode}) =>{
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    return (
        <div>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <main className=" w-full">
                    <Navbar />
                    <div className="">
                        <RegisterSW/>
                        {children}
                        <HomePageContent/>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    )
}


export default Layout