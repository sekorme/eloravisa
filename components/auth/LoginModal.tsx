"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import {auth, db} from "@/firebase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInWithGoogle } from "@/lib/googleSignin"
import { toast } from "sonner"
import {doc, getDoc, setDoc} from "firebase/firestore";

export function LoginModal() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await signInWithEmailAndPassword(auth, email, password)
            setIsOpen(false)
            toast.success("Signed in successfully")
            router.push("/dashboard")
        } catch (err: any) {
            console.error("Login error:", err)
            const message = "Invalid email or password."
            setError(message)
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            const user = await signInWithGoogle()
            if (user) {
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
                        completedOnboarding: false
                    });
                    toast.success("Account created successfully")
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost">Sign in</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign in</DialogTitle>
                    <DialogDescription>Sign in to your account to continue.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-2">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                className="pl-10 h-10 p-6"
                                required
                                style={{ fontSize: "16px" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 h-10 p-6"
                                style={{ fontSize: "16px" }}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div />
                        <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full h-11" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Sign in with Google
                    </Button>
                </form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
