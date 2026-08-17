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
        const isPublicAuthPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

        // Handle normal user routes
        if (!user && isProtectedRoute) {
            router.push("/");
            return;
        }

        // If user is logged in, check their role
        if (user) {
            (async () => {
                try {
                    // Check if they are an influencer
                    const influencerDoc = await getDoc(doc(db, "influencers", user.uid));
                    const isInfluencer = influencerDoc.exists();

                    // If they are an influencer and trying to access normal user routes
                    if (isInfluencer && (isProtectedRoute || isPublicAuthPage)) {
                        router.push("/affiliate/dashboard");
                        return;
                    }

                    // If they are NOT an influencer but trying to access affiliate routes
                    if (!isInfluencer && (isAffiliateDashboard || isAffiliateAuthPage)) {
                        // Decide destination based on onboarding flag
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            if (data.completedOnboarding) {
                                router.push("/dashboard");
                            } else {
                                router.push("/onboarding");
                            }
                        } else {
                            // No user doc yet - assume onboarding required
                            router.push("/onboarding");
                        }
                        return;
                    }

                    // For normal users on normal routes
                    if (!isInfluencer && isPublicAuthPage) {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            if (data.completedOnboarding) {
                                router.push("/dashboard");
                            } else {
                                router.push("/onboarding");
                            }
                        } else {
                            router.push("/onboarding");
                        }
                        return;
                    }

                    // If normal user is navigating to /dashboard but hasn't completed onboarding
                    if (!isInfluencer && pathname.startsWith("/dashboard")) {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            if (!data.completedOnboarding) {
                                router.push("/onboarding");
                            }
                        }
                    }

                    // If normal user is on onboarding but already completed it
                    if (!isInfluencer && pathname.startsWith("/onboarding")) {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) {
                            const data = userDoc.data();
                            if (data.completedOnboarding) {
                                router.push("/dashboard");
                            }
                        }
                    }
                } catch (err) {
                    console.error('Auth redirection error:', err);
                }
            })();
            return;
        }

        // Handle affiliate routes (unauthenticated)
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
