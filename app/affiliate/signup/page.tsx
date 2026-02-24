// app/affiliate/signup/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { influencerSignup } from "@/lib/influencerAuth"
import { toast } from "sonner"
import { Loader2, Globe, Phone, Calendar, Instagram, Facebook, Video, Share2 } from "lucide-react"
import Link from "next/link"
import countries from "world-countries"
import { AffiliateBackground } from "@/components/affiliate/AffiliateBackground"

export default function AffiliateSignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        country: "",
        phone: "",
        dob: "",
        tiktok: "",
        instagram: "",
        facebook: "",
        other: "",
    })

    const formattedCountries = countries.map((country) => ({
        value: country.name.common,
        label: country.name.common,
        flag: country.flag
    })).sort((a, b) => a.label.localeCompare(b.label))

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleCountryChange = (value: string) => {
        setFormData(prev => ({ ...prev, country: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await influencerSignup(
                formData.email, 
                formData.password, 
                formData.fullName,
                formData.country,
                formData.phone,
                formData.dob,
                {
                    tiktok: formData.tiktok,
                    instagram: formData.instagram,
                    facebook: formData.facebook,
                    other: formData.other
                }
            )
            toast.success("Affiliate account created! Welcome aboard.")
            router.push("/affiliate/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Failed to sign up")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
            <div className="relative flex-1">
                <AffiliateBackground />
                <div className="flex items-center justify-center p-4 py-12 relative z-10">
                    <Card className="w-full max-w-2xl bg-background/80 backdrop-blur-sm border-muted">
                    <CardHeader>
                        <CardTitle className="text-2xl">Affiliate Sign Up</CardTitle>
                        <CardDescription>Join our partner program and start earning</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input 
                                        id="fullName" 
                                        placeholder="John Doe" 
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
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
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="phone" 
                                            placeholder="+1 234 567 890" 
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Select onValueChange={handleCountryChange} required>
                                        <SelectTrigger id="country">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formattedCountries.map((country) => (
                                                <SelectItem key={country.value} value={country.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{country.flag}</span>
                                                        <span>{country.label}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            id="dob" 
                                            type="date" 
                                            className="pl-10"
                                            value={formData.dob}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold border-b pb-2">Social Media Handles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tiktok" className="flex items-center gap-2">
                                            <Video className="h-4 w-4" /> TikTok
                                        </Label>
                                        <Input 
                                            id="tiktok" 
                                            placeholder="@username" 
                                            value={formData.tiktok}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instagram" className="flex items-center gap-2">
                                            <Instagram className="h-4 w-4" /> Instagram
                                        </Label>
                                        <Input 
                                            id="instagram" 
                                            placeholder="@username" 
                                            value={formData.instagram}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook" className="flex items-center gap-2">
                                            <Facebook className="h-4 w-4" /> Facebook
                                        </Label>
                                        <Input 
                                            id="facebook" 
                                            placeholder="Profile Link/Name" 
                                            value={formData.facebook}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="other" className="flex items-center gap-2">
                                            <Share2 className="h-4 w-4" /> Other
                                        </Label>
                                        <Input 
                                            id="other" 
                                            placeholder="Platform & Handle" 
                                            value={formData.other}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full mt-10" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/affiliate/signin" className="text-primary hover:underline">
                                    Sign In
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
