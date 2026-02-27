"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth } from "@/firebase/client"
import { useRouter, usePathname } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { db } from "@/firebase/client"
import { doc, getDoc } from "firebase/firestore"

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
            return;
        }

        // If user is logged in and on public auth page, decide destination based on onboarding flag
        if (user && isPublicAuthPage && !isAffiliateDashboard && !isAffiliateAuthPage) {
            (async () => {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data() as any;
                        if (data.completedOnboarding) {
                            router.push("/dashboard");
                        } else {
                            router.push("/onboarding");
                        }
                    } else {
                        // No user doc yet - assume onboarding required
                        router.push("/onboarding");
                    }
                } catch (err) {
                    console.error('Failed to read user doc for redirect:', err);
                    // Fallback
                    router.push("/dashboard");
                }
            })()
            return;
        }

        // If user is navigating to /dashboard but hasn't completed onboarding, redirect to onboarding
        if (user && pathname.startsWith("/dashboard")) {
            (async () => {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data() as any;
                        if (!data.completedOnboarding) {
                            router.push("/onboarding");
                        }
                    }
                } catch (err) {
                    console.error('Failed to verify onboarding status:', err);
                }
            })()
            return;
        }

        // If user is on onboarding but already completed it, send to dashboard
        if (user && pathname.startsWith("/onboarding")) {
            (async () => {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data() as any;
                        if (data.completedOnboarding) {
                            router.push("/dashboard");
                        }
                    }
                } catch (err) {
                    console.error('Failed to verify onboarding status for onboarding route:', err);
                }
            })()
            return;
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
