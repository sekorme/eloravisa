"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/firebase/client"
import { useRouter, usePathname } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

interface AuthContextType {
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (loading) return;

        const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
        const isAffiliateDashboard = pathname.startsWith("/affiliate/dashboard");
        const isAffiliateAuthPage = pathname === "/affiliate/signin" || pathname === "/affiliate/signup";
        const isPublicAuthPage = pathname === "/" || pathname === "/login";

        // Handle normal user routes
        if (!user && isProtectedRoute) {
            router.push("/");
        }

        // If user is logged in and tries to access landing/login page, redirect to dashboard
        if (user && isPublicAuthPage && !isAffiliateDashboard && !isAffiliateAuthPage) {
            router.push("/dashboard");
        }
        
        // Handle affiliate routes (minimal logic here, can be expanded)
        if (!user && isAffiliateDashboard) {
            router.push("/affiliate/signin");
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {loading ? <LoadingSpinner /> : children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
