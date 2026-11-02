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
    Video,
    CalendarClock,
    Wallet,
    HeartHandshake,
    UsersRound,
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

// Grouped so the menu reads as a journey rather than a flat list of tools.
const groups: { label: string; items: { title: string; url: string; icon: typeof Home }[] }[] = [
    { label: "Overview", items: [{ title: "Home", url: "/dashboard", icon: Home }] },
    {
        label: "Prepare",
        items: [
            { title: "My Application", url: "/dashboard/application", icon: FileCheck },
            { title: "Funds Check", url: "/dashboard/finances", icon: Wallet },
            { title: "AI Document Draft", url: "/dashboard/draft", icon: FileText },
            { title: "Visa Information", url: "/dashboard/information", icon: Info },
        ],
    },
    {
        label: "Practise",
        items: [
            { title: "AI Mock Interview", url: "/dashboard/ai-mock-interview", icon: Mic },
            { title: "Live Sessions", url: "/dashboard/live-sessions", icon: Video },
        ],
    },
    {
        label: "Your interview",
        items: [
            { title: "Embassy Appointment", url: "/dashboard/appointment", icon: CalendarClock },
            { title: "Refusal Recovery", url: "/dashboard/refusal", icon: HeartHandshake },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Family & Group", url: "/dashboard/family", icon: UsersRound },
            { title: "Subscription", url: "/dashboard/subscription", icon: CircleDollarSign },
            { title: "History", url: "/dashboard/history", icon: History },
        ],
    },
];

/** Page titles for the top bar, from the menu (so the two always match). */
export const DASHBOARD_PAGE_TITLES: Record<string, string> = Object.fromEntries(
    groups.flatMap((g) => g.items.map((i) => [i.url, i.title])),
);

const affiliateItems = [
    { title: 'Referrals', url: '/affiliate/dashboard', icon: Users },
    { title: 'Withdrawals', url: '/affiliate/dashboard/withdrawals', icon: CircleDollarSign },
    { title: 'Settings', url: '/affiliate/dashboard/settings', icon: Settings },
]

const AppSidebar = () => {
    const pathname = usePathname()
    const isAffiliate = pathname?.startsWith('/affiliate')
    const menuGroups = isAffiliate ? [{ label: "Affiliate", items: affiliateItems }] : groups

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
                {menuGroups.map((group) => (
                 <SidebarGroup key={group.label} className="py-1">
                     <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                     <SidebarGroupContent>
                         <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
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
                ))}

                {/* If on affiliate area, move settings under affiliate menu or keep generic settings for dashboard */}
                {!isAffiliate && (
                  <SidebarGroup className={"mt-auto"}>
                      <SidebarGroupLabel>Settings</SidebarGroupLabel>
                      <SidebarGroupContent>
                          <SidebarMenu>
                              <SidebarMenuItem>
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
                     <SidebarMenuItem>
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
