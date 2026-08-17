"use server"

import React from "react"
import {SidebarProvider} from "@/components/ui/sidebar";

import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import {cookies} from "next/headers";
import HomePageContent from "@/components/HomePageContent";
import {RegisterSW} from "@/components/RegisterSW";
import {AuthProvider} from "@/context/AuthContext";



const Layout = async({children}:{children: React.ReactNode}) =>{
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    return (
        <div>
            <AuthProvider>
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
            </AuthProvider>
        </div>
    )
}


export default Layout