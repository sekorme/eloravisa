"use client";

import {
    Home,
    Settings,
    User2,
    CircleDollarSign,
    FileText,
    FileCheck,
    History,
    Info,
    Mic,
    Users,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation'

const items = [
    {
        title: "Home",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "My Application",
        url: "/dashboard/application",
        icon: FileCheck,
    },

    {
        title: "AI Mock Interview",
        url: "/dashboard/ai-mock-interview",
        icon: Mic,
    },
    {
        title:"AI Document Draft",
        url : "/dashboard/draft",
        icon: FileText,

    },
    {
        title: "History",
        url: "/dashboard/history",
        icon: History,
    },
    {
        title: "Information",
        url: "/dashboard/information",
        icon: Info,
    },
    {
        title: "Subscription",
        url: "/dashboard/subscription",
        icon: CircleDollarSign,
    },
];

const affiliateItems = [
    { title: 'Referrals', url: '/affiliate/dashboard', icon: Users },
    { title: 'Withdrawals', url: '/affiliate/dashboard/withdrawals', icon: CircleDollarSign },
    { title: 'Settings', url: '/affiliate/dashboard/settings', icon: Settings },
]

const AppSidebar = () => {
    const pathname = usePathname()
    const isAffiliate = pathname?.startsWith('/affiliate')
    const menuItems = isAffiliate ? affiliateItems : items

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="py-4 flex items-center justify-between">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                <Image src="/eloravisa.PNG" alt="logo" width={40} height={40} />
                                <span>Elora Visa</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* Mobile toggle visible when sidebar is collapsed/hidden */}
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
            </SidebarHeader>
             <SidebarSeparator />
             <SidebarContent>
                 <SidebarGroup>
                     <SidebarGroupLabel>Application</SidebarGroupLabel>
                     <SidebarGroupContent>
                         <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title} className={""}>
                                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                         </SidebarMenu>
                     </SidebarGroupContent>
                 </SidebarGroup>

                {/* If on affiliate area, move settings under affiliate menu or keep generic settings for dashboard */}
                {!isAffiliate && (
                  <SidebarGroup className={"mt-auto"}>
                      <SidebarGroupLabel>Settings</SidebarGroupLabel>
                      <SidebarGroupContent>
                          <SidebarMenu>
                              <SidebarMenuItem className={"text-[#00b7fa]"}>
                                  <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === "/dashboard/settings"}>
                                      <Link href="/dashboard/settings">
                                          <Settings />
                                          <span>Settings</span>
                                      </Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                          </SidebarMenu>
                      </SidebarGroupContent>
                  </SidebarGroup>
                )}
             </SidebarContent>
             <SidebarFooter>
                 <SidebarMenu>
                     <SidebarMenuItem className={"text-[#00b7fa]"}>
                         <SidebarMenuButton asChild tooltip="Profile" isActive={pathname === "/dashboard/profile"}>
                             <Link href="/dashboard/profile">
                                 <User2 />
                                 <span>Profile</span>
                             </Link>
                         </SidebarMenuButton>
                     </SidebarMenuItem>
                 </SidebarMenu>
             </SidebarFooter>
         </Sidebar>
     );
 };

 export default AppSidebar;
