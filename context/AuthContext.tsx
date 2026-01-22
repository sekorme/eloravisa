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
        const isPublicAuthPage = pathname === "/" || pathname === "/login";

        // If user is not logged in and tries to access a protected route, redirect to home
        if (!user && isProtectedRoute) {
            router.push("/");
        }

        // If user is logged in and tries to access landing/login page, redirect to dashboard
        if (user && isPublicAuthPage) {
            router.push("/dashboard");
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {loading ? <LoadingSpinner /> : children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
