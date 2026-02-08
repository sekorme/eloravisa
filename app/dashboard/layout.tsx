"use server"

import React from "react"
import {SidebarProvider} from "@/components/ui/sidebar";

import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import {cookies} from "next/headers";
import {getGeminiKey} from "@/action/ai";
import HomePageContent from "@/components/HomePageContent";
import {RegisterSW} from "@/components/RegisterSW";



const Layout = async({children}:{children: React.ReactNode}) =>{
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    const keys = await getGeminiKey()
    return (
        <div>
            <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <main className=" w-full">
                    <Navbar />
                    <div className="">
                        <RegisterSW/>
                        {children}

                        <HomePageContent key={keys!}/>
                    </div>
                </main>
            </SidebarProvider>
        </div>
    )
}


export default Layout