"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth, db } from "@/firebase/client"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AvatarUploader } from "./AvatarUploader"
import countries from "world-countries"

// Sorted list of countries
const countryList = countries
    .map(c => ({
        name: c.name.common,
        code: c.cca2
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

export default function ProfileForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        // Onboarding fields
        residence: "",
        destination: "",
        visaType: "",
        appStatus: "",
        avatarUrl: ""
    })

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid))
                    if (userDoc.exists()) {
                        const data = userDoc.data()
                        setFormData({
                            fullName: data.fullName || "",
                            email: data.email || currentUser.email || "",
                            phone: data.phone || "",
                            country: data.country || "",
                            residence: data.onboarding?.residence || "",
                            destination: data.onboarding?.destination || "",
                            visaType: data.onboarding?.visaType || "",
                            appStatus: data.onboarding?.appStatus || "",
                            avatarUrl: data.avatarUrl || ""
                        })
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error)
                    toast.error("Failed to load profile")
                }
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSelectChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleAvatarUpdate = (url: string) => {
        setFormData(prev => ({ ...prev, avatarUrl: url }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setSaving(true)
        try {
            const userRef = doc(db, "users", user.uid)
            
            // Update main fields
            await updateDoc(userRef, {
                fullName: formData.fullName,
                phone: formData.phone,
                country: formData.country,
                // Update nested onboarding fields
                "onboarding.residence": formData.residence,
                "onboarding.destination": formData.destination,
                "onboarding.visaType": formData.visaType,
                "onboarding.appStatus": formData.appStatus,
                updatedAt: new Date().toISOString()
            })

            toast.success("Profile updated successfully")
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="h-96 animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2" />
    }

    return (
        <div className="grid gap-8">
            <Card className="rounded-[1.5rem] border-lp-line bg-lp-card text-lp-fg shadow-none lp-shadow">
                <CardHeader className="border-b border-lp-line pb-6">
                    <CardTitle className="font-display text-xl font-semibold tracking-[-0.03em]">Personal Information</CardTitle>
                    <CardDescription className="text-lp-muted">Update your personal details and avatar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <AvatarUploader 
                                currentAvatarUrl={formData.avatarUrl} 
                                fullName={formData.fullName} 
                                onAvatarUpdate={handleAvatarUpdate}
                            />
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                            <div className="grid gap-2">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="fullName">Full Name</Label>
                                <Input className="h-11 rounded-xl border-lp-line bg-lp-card focus-visible:ring-lp-azure" id="fullName" value={formData.fullName} onChange={handleInputChange} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="email">Email</Label>
                                    <Input id="email" value={formData.email} disabled className="h-11 rounded-xl border-lp-line bg-lp-card-2" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="phone">Phone Number</Label>
                                    <Input className="h-11 rounded-xl border-lp-line bg-lp-card focus-visible:ring-lp-azure" id="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="country">Citizenship</Label>
                                <Select value={formData.country} onValueChange={(v) => handleSelectChange("country", v)}>
                                    <SelectTrigger className="!h-11 w-full rounded-xl border-lp-line bg-lp-card">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countryList.map((c) => (
                                            <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </form>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-lp-line bg-lp-card text-lp-fg shadow-none lp-shadow">
                <CardHeader className="border-b border-lp-line pb-6">
                    <CardTitle className="font-display text-xl font-semibold tracking-[-0.03em]">Application Details</CardTitle>
                    <CardDescription className="text-lp-muted">Manage your visa application preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="residence">Country of Residence</Label>
                                <Select value={formData.residence} onValueChange={(v) => handleSelectChange("residence", v)}>
                                    <SelectTrigger className="!h-11 w-full rounded-xl border-lp-line bg-lp-card"><SelectValue placeholder="Select residence" /></SelectTrigger>
                                    <SelectContent>
                                        {countryList.map((c) => (
                                            <SelectItem key={c.code + "res"} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="destination">Destination Country</Label>
                                <Select value={formData.destination} onValueChange={(v) => handleSelectChange("destination", v)}>
                                    <SelectTrigger className="!h-11 w-full rounded-xl border-lp-line bg-lp-card"><SelectValue placeholder="Select destination" /></SelectTrigger>
                                    <SelectContent>
                                        {countryList.map((c) => (
                                            <SelectItem key={c.code + "dest"} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="visaType">Visa Type</Label>
                                <Select value={formData.visaType} onValueChange={(v) => handleSelectChange("visaType", v)}>
                                    <SelectTrigger className="!h-11 w-full rounded-xl border-lp-line bg-lp-card"><SelectValue placeholder="Select visa type" /></SelectTrigger>
                                    <SelectContent>
                                        {["Study", "Visit", "Work", "Family"].map((v) => (
                                            <SelectItem key={v} value={v}>{v}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted" htmlFor="appStatus">Application Status</Label>
                                <Select value={formData.appStatus} onValueChange={(v) => handleSelectChange("appStatus", v)}>
                                    <SelectTrigger className="!h-11 w-full rounded-xl border-lp-line bg-lp-card"><SelectValue placeholder="Current status" /></SelectTrigger>
                                    <SelectContent>
                                        {["Not started", "In progress", "Appointment booked", "Previously refused"].map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving} className="h-12 w-full rounded-full bg-lp-navy px-7 font-semibold text-white hover:bg-lp-navy-2 md:w-auto">
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
