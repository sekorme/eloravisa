// app/affiliate/signin/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { influencerSignin } from "@/lib/influencerAuth"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import AffiliateHomeNavbar from "@/components/affiliate/AffiliateHomeNavbar"
import { AffiliateBackground } from "@/components/affiliate/AffiliateBackground"

export default function AffiliateSigninPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await influencerSignin(formData.email, formData.password)
            toast.success("Signed in successfully!")
            router.push("/affiliate/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Failed to sign in")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <AffiliateHomeNavbar />
            <div className="relative flex-1">
                <AffiliateBackground />
                <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)] relative z-10">
                    <Card className="w-full max-w-md bg-background/80 backdrop-blur-sm border-muted">
                    <CardHeader>
                        <CardTitle className="text-2xl">Affiliate Sign In</CardTitle>
                        <CardDescription>Access your dashboard and track earnings</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full mt-10" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Don't have an account?{" "}
                                <Link href="/affiliate/signup" className="text-primary hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            </div>
        </div>
    )
}
