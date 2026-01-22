"use client";

import { useState, useEffect } from "react";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
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
import { doc, getDoc } from "firebase/firestore";

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
    const { setTheme } = useTheme();
    const pathname = usePathname() || "/";
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } else {
                setUserData(null);
            }
        });
        return () => unsubscribe();
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
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="p-4 flex drop-blur-md items-center  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 justify-between sticky top-0  z-50">
            {/* LEFT */}
            <SidebarTrigger />

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                <Link href={pathname} className="font-semibold">
                    {currentTitle}
                </Link>
                {/* THEME MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* USER MENU */}
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarImage src={userData?.avatarUrl} />
                            <AvatarFallback>{getInitials(userData?.fullName)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={10}>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                            <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                            <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default Navbar;
