"use client";

import { useState, useEffect } from "react";
import { ChevronDown, LogOut, Monitor, Moon, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import { Coins } from "lucide-react";
import {NumberTicker} from "@/components/ui/number-ticker";
import {NotificationBell} from "@/components/NotificationBell";

function titleizeSegment(seg: string) {
    if (!seg) return "";
    const map: Record<string, string> = {
        "ai-mock-interview": "AI Mock Interview",
        "review": "AI Document Review",
        "application": "My Application",
        "information": "Information",
        "home": "Home",
        "pagecheck": "Page Check",
        "history": "History",
    };
    if (map[seg]) return map[seg];
    // fallback: replace dashes and capitalise words
    return seg
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
}

const Navbar = () => {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname() || "/";
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        // onAuthStateChanged ignores its callback's return value, so the
        // Firestore listener has to be torn down by hand on user change/unmount.
        let unsubDoc: (() => void) | undefined;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubDoc?.();
            unsubDoc = undefined;
            if (user) {
                // Use onSnapshot for real-time token updates
                const userDocRef = doc(db, "users", user.uid);
                unsubDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        // Include the user ID in the state
                        setUserData({ ...doc.data(), id: user.uid });
                    }
                });
            } else {
                setUserData(null);
            }
        });
        return () => {
            unsubDoc?.();
            unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Compute a friendly title for dashboard pages
    let currentTitle = "";
    if (pathname.startsWith("/dashboard")) {
        const parts = pathname.split("/").filter(Boolean);
        if (parts.length <= 1) {
            currentTitle = "Home";
        } else {
            currentTitle = titleizeSegment(parts[1]);
        }
    } else {
        const parts = pathname.split("/").filter(Boolean);
        currentTitle = parts.length ? titleizeSegment(parts[parts.length - 1]) : "Home";
    }

    const getInitials = (name: string) => {
        if (!name?.trim()) return "U";
        const names = name.trim().split(/\s+/);
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const firstName = userData?.fullName?.trim().split(/\s+/)[0];
    const themeOptions = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];
    const iconButton = "relative h-10 w-10 rounded-full border-lp-line bg-lp-card text-lp-fg shadow-none hover:border-lp-fg/30 hover:bg-lp-card-2 focus-visible:ring-lp-azure";

    return (
        <nav className="sticky top-0 z-50 flex h-16 items-center justify-between gap-3 border-b border-lp-line bg-lp-page/80 px-3 text-lp-fg backdrop-blur-xl supports-[backdrop-filter]:bg-lp-page/70 md:h-[72px] md:px-6">
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="h-10 w-10 shrink-0 rounded-full border border-lp-line bg-lp-card text-lp-fg hover:bg-lp-card-2" />
                <div className="hidden h-6 w-px bg-lp-line sm:block" aria-hidden="true" />
                <div className="min-w-0">
                    <div className="hidden font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted sm:block">
                        Dashboard
                    </div>
                    <Link href={pathname} className="block truncate font-display text-base font-semibold tracking-[-0.02em] md:text-lg">
                        {currentTitle}
                    </Link>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex shrink-0 items-center gap-2 md:gap-3">
                {userData && (
                    <Link
                        href="/dashboard/subscription"
                        aria-label={`${userData.tokens || 0} tokens. Manage subscription`}
                        className="group flex h-10 items-center gap-2 rounded-full border border-lp-line bg-lp-card py-1 pl-1 pr-3.5 transition-colors hover:border-lp-azure/40 hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lp-navy text-[#8FCDAF]">
                            <Coins className="h-4 w-4" />
                        </span>
                        <span className="font-display text-sm font-semibold tabular-nums">{<NumberTicker value={userData.tokens || 0}/>}</span>
                        <span className="hidden text-xs text-lp-muted lg:inline">tokens</span>
                    </Link>
                )}
                {userData && <NotificationBell userId={userData.id} />}
                {/* THEME MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className={iconButton}>
                            <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={10} className="min-w-40 rounded-2xl border-lp-line bg-lp-card p-1.5 text-lp-fg">
                        {themeOptions.map(({ value, label, icon: Icon }) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => setTheme(value)}
                                className={`rounded-xl px-3 py-2 ${theme === value ? "bg-lp-sky font-semibold text-lp-azure" : ""}`}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* USER MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure md:pr-2.5">
                        <Avatar className="h-9 w-9 ring-2 ring-lp-card">
                            <AvatarImage src={userData?.avatarUrl} className="object-cover" />
                            <AvatarFallback className="bg-lp-navy font-display text-xs font-semibold text-white">{getInitials(userData?.fullName)}</AvatarFallback>
                        </Avatar>
                        {firstName && <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">{firstName}</span>}
                        <ChevronDown className="hidden h-4 w-4 text-lp-muted transition-transform group-data-[state=open]:rotate-180 md:block" />
                        <span className="sr-only">Open account menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={10} className="w-60 rounded-2xl border-lp-line bg-lp-card p-1.5 text-lp-fg">
                        <DropdownMenuLabel className="px-3 py-2.5 font-normal">
                            <div className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">My Account</div>
                            {userData?.fullName && <div className="mt-1 truncate text-sm font-semibold">{userData.fullName}</div>}
                            {userData?.email && <div className="truncate text-xs text-lp-muted">{userData.email}</div>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-lp-line" />
                        <DropdownMenuItem className="rounded-xl px-3 py-2" onClick={() => router.push('/dashboard/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl px-3 py-2" onClick={() => router.push('/dashboard/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-lp-line" />
                        <DropdownMenuItem variant="destructive" className="rounded-xl px-3 py-2" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default Navbar;
