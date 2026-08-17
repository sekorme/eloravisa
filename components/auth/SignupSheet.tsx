"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { Calendar as CalendarIcon, Globe, Mail, Lock, User, Phone, Loader2 } from "lucide-react"


import countries from "world-countries"
import { signup } from "@/lib/signUp"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db, auth } from "@/firebase/client"
import { signInWithGoogle } from "@/lib/googleSignin"
import { signOut } from "firebase/auth"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions"
import {registrationEmail} from "@/lib/registrationEmail";

function celebrateSignup() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 100,
    });
}

export function SignupSheet({className, desscription}: {className?: string, desscription?: string}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [date, setDate] = useState<Date>()
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        dob:"",
        password: "",
        phone: "",
        country: "",
    })

    const formattedCountries = countries.map((country) => ({
        value: country.name.common,
        label: country.name.common,
        flag: country.flag
    })).sort((a, b) => a.label.localeCompare(b.label))

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id === "phone-number" ? "phone" : id === "full-name" ? "fullName" : id]: value }))
    }

    const handleCountryChange = (value: string) => {
        setFormData(prev => ({ ...prev, country: value }))
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Create Firebase Auth User
            const user = await signup(formData.email, formData.password)
            const {email, fullName} = formData

            if (user) {
                // Check if they are an influencer (they might have an account in Firebase but not in users doc)
                // Although signup() creates a new user, if they already exist it might fail or return existing.
                // If they exist in influencers, we should block them.
                const influencerDoc = await getDoc(doc(db, "influencers", user.uid))
                if (influencerDoc.exists()) {
                    await signOut(auth)
                    toast.error("This account is registered as an affiliate. Please use a different email or sign in through the affiliate portal.")
                    return
                }

                // 2. Save initial data directly to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    dob: formData.dob ? formData.dob : null,
                    country: formData.country,
                    createdAt: new Date().toISOString(),
                    completedOnboarding: false,
                    tokens: SUBSCRIPTION_PLANS.FREE.tokens,
                    planId: SUBSCRIPTION_PLANS.FREE.id
                });

                toast.success("Account created successfully")
                celebrateSignup()
                await registrationEmail({email, name:fullName})
                // 3. Redirect to onboarding
                router.push("/onboarding")
            }
        } catch (error: any) {
            console.error("Signup error:", error)
            toast.error(error.message || "Failed to create account")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setIsLoading(true)
        try {
            const user = await signInWithGoogle()
            if (user) {
                // Check if they are an influencer
                const influencerDoc = await getDoc(doc(db, "influencers", user.uid))
                if (influencerDoc.exists()) {
                    await signOut(auth)
                    toast.error("This account is registered as an affiliate. Please sign in through the affiliate portal.")
                    return
                }

                // Check if user doc exists
                const userDoc = await getDoc(doc(db, "users", user.uid))

                if (!userDoc.exists()) {
                    // Create new user doc if it doesn't exist
                    await setDoc(doc(db, "users", user.uid), {
                        fullName: user.displayName || "",
                        email: user.email || "",
                        phone: user.phoneNumber || "",
                        dob: null,
                        country: "",
                        createdAt: new Date().toISOString(),
                        completedOnboarding: false,
                        tokens: SUBSCRIPTION_PLANS.FREE.tokens,
                        planId: SUBSCRIPTION_PLANS.FREE.id
                    });
                    toast.success("Account created successfully")
                    celebrateSignup()
                    router.push("/onboarding")
                } else {
                    // If user exists, check if they completed onboarding
                    const userData = userDoc.data()
                    toast.success("Signed in successfully")
                    if (userData.completedOnboarding) {
                        router.push("/dashboard")
                    } else {
                        router.push("/onboarding")
                    }
                }
            }
        } catch (error: any) {
            console.error("Google signup error:", error)
            toast.error("Failed to sign up with Google")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="lg"  className={` ${className}`}>{desscription}</Button>
            </SheetTrigger>
            <SheetContent className="w-full p-4 sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                    <SheetTitle className="text-2xl font-bold">Create an Account</SheetTitle>
                    <SheetDescription>
                        Start your visa application journey with us today.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSignup} className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="full-name"
                                placeholder="John Doe"
                                className="pl-10 h-10 p-6 ml-1"
                                style={{ fontSize: "16px" }}
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10 h-10 p-6 ml-1"
                                style={{ fontSize: "16px" }}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                className="pl-10 h-10 p-6 ml-1"
                                style={{ fontSize: "16px" }}
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone-number">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone-number"
                                    placeholder="+1 234..."
                                    className="pl-10 h-10 p-6 ml-1"
                                    style={{ fontSize: "16px" }}
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" style={{ fontSize: "16px" }} placeholder="MM/DD/YYYY" className="pl-10 h-10" value={formData.dob} onChange={handleInputChange} required/>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="country">Country of Citizenship</Label>
                        <Select onValueChange={handleCountryChange}>
                            <SelectTrigger className="w-full p-6 h-10 pl-10 relative">

                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                                {formattedCountries.map((country) => (
                                    <SelectItem key={country.value} value={country.value}>
                                        <span className="mr-2">{country.flag}</span>
                                        {country.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <SheetFooter className="mt-6 flex-col gap-4 sm:flex-col">
                        <Button type="submit" className="w-full h-11 text-base shadow-md" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full h-11" type="button" onClick={handleGoogleSignUp} disabled={isLoading}>
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Google
                        </Button>

                        <p className="text-center text-xs text-muted-foreground mt-4">
                            By clicking continue, you agree to our{" "}
                            <a href="/legal/terms-of-service" target="_blank" className="underline hover:text-primary">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="/legal/privacy-policy" target="_blank" className="underline hover:text-primary">
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
